import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

interface ChatRequestBody {
  messages?: unknown;
  treatmentContext?: {
    nickname?: string;
    protocolName?: string;
    phaseName?: string;
    currentPhase?: number;
    totalPhases?: number;
    adherenceRate?: number;
    sessionsCompleted?: number;
    sessionsPrescribed?: number;
    lastPain?: number;
    currentWeek?: number;
    weekRomTarget?: string;
    weekMilestones?: string[];
    weekCaution?: string;
    clinicalSource?: string;
    safetyAlert?: string;
    lagSignNote?: string;
    returnToSportNote?: string;
  } | null;
}

const BASE_SYSTEM = `Você é o AI Doctor do FisioCare, um assistente conversacional para pacientes em reabilitação ortopédica de joelho (LCA, menisco, patelofemoral).

Como você responde:
- Sempre em português brasileiro, tom acolhedor, claro e curto (2 a 6 frases na maioria das respostas).
- Use markdown leve: listas curtas, **negritos** para pontos-chave. Nunca use HTML.
- Quando fizer sentido, faça uma pergunta de volta para entender melhor a queixa do paciente.

Limites importantes:
- Você é apoio educacional e de adesão — não substitui consulta médica, diagnóstico ou prescrição.
- Não receite medicamentos, doses ou novos exercícios fora do protocolo. Em vez disso, oriente o paciente a falar com o médico responsável.
- Diante de sinais de alerta (dor aguda forte, inchaço súbito, febre, sensação de instabilidade, perda de movimento, vermelhidão localizada com calor), oriente imediatamente a contactar o médico ou serviço de emergência.
- Não invente dados clínicos do paciente. Use apenas o contexto recebido.
- O protocolo segue um manual clínico oficial com metas semanais. NUNCA incentive o paciente a ir além da meta da semana atual (amplitude de flexão, carga ou atividade) — mesmo que ele peça. Progressões só com o médico/fisioterapeuta.
- Se o paciente relatar dor, inchaço ou instabilidade durante exercícios, oriente a pausar e avisar o fisioterapeuta (tríade de alerta do manual).`;

function contextBlock(ctx: ChatRequestBody["treatmentContext"]) {
  if (!ctx) return "\n\nContexto do paciente: nenhum tratamento ativo no momento.";
  const parts: string[] = [];
  if (ctx.nickname) parts.push(`Tratamento: ${ctx.nickname}`);
  if (ctx.protocolName) parts.push(`Protocolo: ${ctx.protocolName}`);
  if (ctx.currentPhase && ctx.totalPhases) {
    parts.push(
      `Fase atual: ${ctx.currentPhase}/${ctx.totalPhases}${ctx.phaseName ? ` (${ctx.phaseName})` : ""}`,
    );
  }
  if (typeof ctx.adherenceRate === "number") parts.push(`Adesão: ${ctx.adherenceRate}%`);
  if (typeof ctx.sessionsCompleted === "number" && typeof ctx.sessionsPrescribed === "number") {
    parts.push(`Sessões: ${ctx.sessionsCompleted}/${ctx.sessionsPrescribed}`);
  }
  if (typeof ctx.lastPain === "number") parts.push(`Última dor reportada: ${ctx.lastPain}/10`);
  if (ctx.currentWeek) parts.push(`Semana pós-operatória atual: ${ctx.currentWeek}`);
  if (ctx.weekRomTarget) parts.push(`Meta da semana (manual clínico): ${ctx.weekRomTarget}`);
  if (ctx.weekMilestones?.length) parts.push(`Marcos da semana: ${ctx.weekMilestones.join("; ")}`);
  if (ctx.weekCaution) parts.push(`Cuidado específico da semana: ${ctx.weekCaution}`);
  if (ctx.safetyAlert) parts.push(`Alerta de segurança do manual: ${ctx.safetyAlert}`);
  if (ctx.lagSignNote) parts.push(`Sinal de Lag: ${ctx.lagSignNote}`);
  if (ctx.returnToSportNote) parts.push(`Retorno ao esporte: ${ctx.returnToSportNote}`);
  if (ctx.clinicalSource) parts.push(`Fonte clínica do protocolo: ${ctx.clinicalSource}`);
  return `\n\nContexto do paciente (use somente se relevante):\n- ${parts.join("\n- ")}`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const messages = body.messages as UIMessage[];

        const result = streamText({
          model,
          system: BASE_SYSTEM + contextBlock(body.treatmentContext ?? null),
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
