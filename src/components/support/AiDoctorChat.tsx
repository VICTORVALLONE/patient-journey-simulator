import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RotateCcw, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActiveTreatment } from "@/store/patient";
import { getProtocol, getWeekGuide } from "@/data/protocols";
import { postOpWeekOf } from "@/lib/prescription";
import { realAdherencePct } from "@/lib/dynamicMessages";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api-base";
import { AI_DOCTOR_STORAGE_KEY as STORAGE_KEY } from "@/lib/aiDoctorHistory";

const SUGGESTIONS = [
  "Posso voltar a correr?",
  "Estou sentindo estalos no joelho, é normal?",
  "Como aumento a intensidade dos exercícios?",
  "Posso treinar se estiver com dor leve?",
];

function loadStoredMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function extractText(m: UIMessage): string {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function AiDoctorChat({ className }: { className?: string } = {}) {
  const treatment = useActiveTreatment();

  const treatmentContext = useMemo(() => {
    if (!treatment) return null;
    const protocol = getProtocol(treatment.protocol_id);
    const phase = protocol.phases.find((p) => p.phase_number === treatment.current_phase);
    const lastPainEntry = treatment.pain_history[treatment.pain_history.length - 1];
    const currentWeek = postOpWeekOf(treatment, protocol);
    const weekGuide = getWeekGuide(protocol, currentWeek);
    const guide = protocol.clinical_guide;
    return {
      nickname: treatment.nickname,
      protocolName: protocol.name,
      phaseName: phase?.name,
      currentPhase: treatment.current_phase,
      totalPhases: protocol.phases.length,
      adherenceRate: realAdherencePct(treatment),
      sessionsCompleted: treatment.total_sessions_completed,
      sessionsPrescribed: treatment.total_sessions_prescribed,
      lastPain: lastPainEntry?.average_pain,
      // Guia clínico da cartilha — o coach NÃO deve sugerir nada além destes limites.
      currentWeek,
      weekRomTarget: weekGuide?.rom_target_label,
      weekMilestones: weekGuide?.milestones,
      weekCaution: weekGuide?.caution,
      clinicalSource: guide?.source_title,
      safetyAlert: guide?.safety_alert,
      lagSignNote: guide?.lag_sign_note,
      returnToSportNote: guide?.return_to_sport_note,
    };
  }, [treatment]);

  const [initialMessages] = useState<UIMessage[]>(() => loadStoredMessages());
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: apiUrl("/api/chat"),
        body: () => ({ treatmentContext }),
      }),
    [treatmentContext],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: "ai-doctor",
    messages: initialMessages,
    transport,
  });

  // Persist messages locally.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* quota — ignore */
    }
  }, [messages]);

  // Auto-scroll on new content.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  // Keep textarea focused on idle.
  useEffect(() => {
    if (status === "ready" || status === "error") {
      textareaRef.current?.focus();
    }
  }, [status]);

  const isBusy = status === "submitted" || status === "streaming";

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");
    sendMessage({ text: trimmed });
  }

  function reset() {
    setMessages([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setInput("");
    textareaRef.current?.focus();
  }

  return (
    <div
      className={cn(
        "flex h-[70vh] min-h-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversa
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-full border border-border bg-bg-subtle px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary hover:text-primary"
          aria-label="Reiniciar conversa com AI Doctor"
        >
          <RotateCcw className="h-3 w-3" /> Reiniciar conversa
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Olá! Sou o <span className="font-semibold text-foreground">AI Doctor</span>. Como
              posso te ajudar com seu tratamento hoje?
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border border-border bg-bg-subtle px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = extractText(m);
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                  {text}
                </div>
              </div>
            );
          }
          return (
            <div
              key={m.id}
              className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground"
            >
              {text ? (
                <ReactMarkdown
                  components={{
                    p: ({ node: _n, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({ node: _n, ...props }) => (
                      <ul className="mb-2 list-disc pl-5" {...props} />
                    ),
                    ol: ({ node: _n, ...props }) => (
                      <ol className="mb-2 list-decimal pl-5" {...props} />
                    ),
                    strong: ({ node: _n, ...props }) => (
                      <strong className="font-semibold text-foreground" {...props} />
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
              ) : (
                <span className="text-muted-foreground">…</span>
              )}
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Pensando…
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-danger">
            Não foi possível obter uma resposta. Tente novamente em instantes.
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="border-t border-border bg-card p-3"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(input);
            }
          }}
          placeholder="Pergunte sobre seu tratamento…"
          className={cn("min-h-16 resize-none rounded-xl text-sm")}
          disabled={isBusy}
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Apoio educacional · não substitui consulta médica
          </p>
          <Button
            type="submit"
            size="sm"
            className="rounded-full"
            disabled={isBusy || !input.trim()}
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
