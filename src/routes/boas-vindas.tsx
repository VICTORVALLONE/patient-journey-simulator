import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Stethoscope } from "lucide-react";

import { BunnyVideo } from "@/components/video/BunnyVideo";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Button } from "@/components/ui/button";
import { getProtocol, getWeekGuide } from "@/data/protocols";
import { WELCOME_VIDEO } from "@/data/videos";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import { postOpWeekFromDays, surgeryDateValidity } from "@/lib/entry";
import { requireStage } from "@/lib/route-guards";
import { firstName } from "@/lib/user";
import { useActiveTreatment, usePatientStore } from "@/store/patient";

/**
 * Ponte entre o cadastro e a semana 1. Existe porque o paciente precisa saber o
 * que vai acontecer com ele antes de fazer o primeiro exercício.
 *
 * **Gateia a semana 1, mas o gate é concluir a tela — não assistir ao vídeo.**
 * O produto tem princípio explícito de nunca bloquear por vídeo não visto
 * (`FisioApp_Descricao_Produto.md`), e "nunca punir" é regra do PRODUCT.md.
 *
 * A rota chama-se `/boas-vindas` e não `/welcome` porque `/welcome` é
 * load-bearing: é o `maskPath` do prerender SPA (`vite.config.ts`) e precisa
 * renderizar sem nenhum estado.
 */
export const Route = createFileRoute("/boas-vindas")({
  head: () => ({ meta: [{ title: "Tudo pronto · FisioApp" }] }),
  beforeLoad: () => requireStage(["boas_vindas", "ready"]),
  component: BoasVindasPage,
});

function BoasVindasPage() {
  const hydrated = useHydratedStore();
  const navigate = useNavigate();
  const user = usePatientStore((s) => s.user);
  const treatment = useActiveTreatment();
  const completeWelcome = usePatientStore((s) => s.completeWelcome);

  if (!hydrated || !treatment)
    return (
      <MobileFrame withNav={false}>
        <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
      </MobileFrame>
    );

  const protocol = getProtocol(treatment.protocol_id);
  const guide = protocol.clinical_guide;

  // Semana pós-op real: quem cadastra três semanas depois da cirurgia não pode
  // ler "sua semana 1". Sem data válida, cai em 1 — que é o caso do paciente
  // conservador (sem cirurgia), para quem a semana 1 é a semana de início.
  const validity = surgeryDateValidity(treatment.surgery_date, {
    totalWeeks: protocol.total_weeks,
  });
  const week = validity.state === "ok" ? postOpWeekFromDays(validity.daysSinceSurgery ?? 0) : 1;
  const weekGuide = getWeekGuide(protocol, week);

  const nome = firstName(user.name);

  return (
    <MobileFrame withNav={false}>
      <div className="flex min-h-screen flex-col px-5 pb-8 pt-8">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-muted px-3 py-1 text-xs font-medium text-primary-dark">
          <Stethoscope className="h-3.5 w-3.5" />
          Prescrito por {treatment.prescribed_by}
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground">
          {nome ? `Tudo pronto, ${nome}.` : "Tudo pronto."}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Assista ao vídeo de orientação e veja como será a sua recuperação.
        </p>

        <BunnyVideo
          video={WELCOME_VIDEO}
          title="Boas-vindas: seu protocolo de recuperação"
          className="mt-5"
        />

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Seu protocolo em resumo
          </h2>
          <div className="mt-3">
            {protocol.phases.map((phase, i) => (
              <div
                key={phase.id}
                className={i < protocol.phases.length - 1 ? "border-b border-border py-3" : "pt-3"}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Fase {phase.phase_number} · {phase.name}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {phase.duration_weeks} {phase.duration_weeks === 1 ? "semana" : "semanas"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{phase.focus}</p>
              </div>
            ))}
          </div>
        </section>

        {weekGuide && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sua semana {week}
            </h2>
            <div className="mt-3 rounded-2xl bg-bg-subtle p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Meta de amplitude
              </p>
              <p className="mt-0.5 text-base font-semibold text-foreground">
                {weekGuide.rom_target_label}
              </p>
              {weekGuide.milestones.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {weekGuide.milestones.map((m) => (
                    <li key={m} className="flex gap-2 text-xs leading-snug text-foreground/80">
                      <span
                        aria-hidden
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary"
                      />
                      {m}
                    </li>
                  ))}
                </ul>
              )}
              {weekGuide.caution && (
                <p className="mt-3 text-xs leading-snug text-muted-foreground">
                  {weekGuide.caution}
                </p>
              )}
            </div>
          </section>
        )}

        {guide && (
          <section className="mt-8">
            <div className="flex items-start gap-2.5 rounded-2xl bg-warning/10 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-semibold text-foreground">Quando avisar sua equipe</p>
                <p className="mt-1 text-xs leading-snug text-foreground/80">{guide.safety_alert}</p>
                <p className="mt-2 text-xs leading-snug text-foreground/80">
                  {guide.lag_sign_note}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
              Baseado no {guide.source_title} — {guide.source_authors}.
            </p>
          </section>
        )}

        <Button
          size="lg"
          className="mt-8 w-full rounded-xl"
          onClick={() => {
            completeWelcome(treatment.id);
            void navigate({ to: "/session/$sid", params: { sid: "today" } });
          }}
        >
          Começar minha primeira sessão
        </Button>
        {/* Saída secundária: quem quer conhecer o app antes de suar. Também
            conclui o gate — as boas-vindas são gate de CONCLUSÃO DA TELA, e
            prender quem escolheu a home num loop de boas-vindas seria punir a
            escolha. A sessão do dia continua a um toque na home. */}
        <Button
          variant="outline"
          size="lg"
          className="mt-2 w-full rounded-xl"
          onClick={() => {
            completeWelcome(treatment.id);
            void navigate({ to: "/home" });
          }}
        >
          Ir para a home
        </Button>
      </div>
    </MobileFrame>
  );
}
