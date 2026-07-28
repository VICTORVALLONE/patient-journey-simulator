import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Info, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { usePatientStore } from "@/store/patient";
import type { TreatmentOnboardingDraft } from "@/store/patient";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import { getProtocol, REQUIRES_SURGERY_DATE } from "@/data/protocols";
import { totalSessionsForProtocol } from "@/lib/prescription";
import { postOpWeekFromDays, surgeryDateValidity, todayISO } from "@/lib/entry";
import { MVP_ASK_REMINDER, MVP_ASK_SURGERY_DATE } from "@/lib/mvpFlags";
import type { AffectedSide, InjuryType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/treatment")({
  head: () => ({ meta: [{ title: "Novo tratamento · FisioApp" }] }),
  component: TreatmentOnboardingPage,
});

// Foco atual do piloto: LCA (protocolo baseado no manual clínico oficial).
// Os demais protocolos permanecem no código, mas ficam como "em breve" na seleção.
const INJURY_OPTIONS: {
  value: InjuryType;
  label: string;
  protocolId: string;
  available: boolean;
}[] = [
  { value: "lca", label: "Reconstrução de LCA", protocolId: "proto_lca", available: true },
  { value: "meniscus", label: "Lesão de menisco", protocolId: "proto_meniscus", available: false },
  {
    value: "patellofemoral",
    label: "Síndrome patelofemoral",
    protocolId: "proto_patellofemoral",
    available: false,
  },
];

const EMPTY_TREATMENT_DRAFT: TreatmentOnboardingDraft = {};

/**
 * Passos derivados das flags do MVP, não numerados à mão: a barra de progresso,
 * o botão Voltar e o passo final leem todos desta lista. Desligar um passo em
 * `mvpFlags.ts` encurta a barra e reencadeia a navegação sozinho — sem nenhum
 * índice mágico para corrigir em três lugares.
 */
type StepKey = "injury" | "surgery" | "side" | "doctor";

const STEPS: StepKey[] = [
  "injury",
  ...(MVP_ASK_SURGERY_DATE ? (["surgery"] as StepKey[]) : []),
  "side",
  "doctor",
];

function TreatmentOnboardingPage() {
  const hydrated = useHydratedStore();
  const navigate = useNavigate();
  const isOnboarded = usePatientStore((s) => s.isOnboarded);
  const hasTreatments = usePatientStore((s) => s.treatments.length > 0);
  const draft = usePatientStore((s) => s.onboardingDraft.treatment ?? EMPTY_TREATMENT_DRAFT);
  const setDraft = usePatientStore((s) => s.setTreatmentDraft);
  const startTreatment = usePatientStore((s) => s.startTreatment);

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex]!;
  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));

  useEffect(() => {
    if (hydrated && !isOnboarded) {
      void navigate({ to: "/welcome" });
    }
  }, [hydrated, isOnboarded, navigate]);

  const injury = (draft.injury_type ?? "lca") as InjuryType;
  const protocolMeta = INJURY_OPTIONS.find((i) => i.value === injury)!;
  const protocol = useMemo(() => getProtocol(protocolMeta.protocolId), [protocolMeta.protocolId]);
  const totalSessions = totalSessionsForProtocol(protocol);

  if (!hydrated)
    return (
      <MobileFrame withNav={false}>
        <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
      </MobileFrame>
    );

  if (!isOnboarded) return null;

  // Voltar do passo 1: quem já tem tratamento veio do app (está adicionando um
  // segundo); quem não tem veio do cadastro pessoal.
  const goBackFromFirstStep = () => void navigate({ to: hasTreatments ? "/home" : "/onboarding" });

  return (
    <MobileFrame withNav={false}>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center gap-3 p-4">
          <button
            onClick={() => (stepIndex === 0 ? goBackFromFirstStep() : setStepIndex(stepIndex - 1))}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 gap-1">
            {STEPS.map((key, i) => (
              <div
                key={key}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i <= stepIndex ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
        </header>

        <div className="flex-1 px-5 pb-8">
          {step === "injury" && (
            <StepInjury
              injury={injury}
              protocolName={protocol.name}
              totalWeeks={protocol.total_weeks}
              totalSessions={totalSessions}
              onChange={setDraft}
              onNext={goNext}
            />
          )}
          {step === "surgery" && (
            <StepSurgeryDate
              draft={draft}
              required={REQUIRES_SURGERY_DATE[injury]}
              totalWeeks={protocol.total_weeks}
              onChange={setDraft}
              onNext={goNext}
            />
          )}
          {step === "side" && <StepSide draft={draft} onChange={setDraft} onNext={goNext} />}
          {step === "doctor" && (
            <StepDoctor
              draft={draft}
              onChange={setDraft}
              onFinish={() => {
                startTreatment();
                // A jornada não termina no app: termina nas boas-vindas, que são
                // o gate da semana 1.
                void navigate({ to: "/boas-vindas" });
              }}
            />
          )}
        </div>
      </div>
    </MobileFrame>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StepInjury({
  injury,
  protocolName,
  totalWeeks,
  totalSessions,
  onChange,
  onNext,
}: {
  injury: InjuryType;
  protocolName: string;
  totalWeeks: number;
  totalSessions: number;
  onChange: (v: TreatmentOnboardingDraft) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">Qual é o seu diagnóstico?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Escolha o tipo de lesão para carregarmos o protocolo correspondente.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-2">
        {INJURY_OPTIONS.map((opt) => {
          const active = injury === opt.value;
          return (
            <button
              key={opt.value}
              disabled={!opt.available}
              onClick={() => opt.available && onChange({ injury_type: opt.value })}
              className={cn(
                "rounded-2xl border-2 p-4 text-left transition-all",
                active ? "border-primary bg-primary-muted" : "border-border bg-card",
                !opt.available && "cursor-not-allowed opacity-55",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{opt.label}</p>
                {!opt.available && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Em breve
                  </span>
                )}
              </div>
              {active && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {protocolName} · {totalSessions} sessões em {totalWeeks} semanas
                </p>
              )}
            </button>
          );
        })}
      </div>
      <Button size="lg" className="mt-8 w-full rounded-xl" onClick={onNext}>
        Continuar <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * Tela própria para a data da cirurgia. Ela ganhou o palco porque virou o input
 * mais consequente do produto: fase, meta de ADM, marcos e gráfico derivam dela.
 *
 * O eco ao vivo ("você está na semana N") é a defesa contra data digitada errada
 * — e é deliberadamente **azul, nunca vermelho**: o DESIGN.md reserva Vermelho
 * Alerta para alerta clínico, e "nunca punir" vale também para entrada de dado.
 */
function StepSurgeryDate({
  draft,
  required,
  totalWeeks,
  onChange,
  onNext,
}: {
  draft: TreatmentOnboardingDraft;
  required: boolean;
  totalWeeks: number;
  onChange: (v: TreatmentOnboardingDraft) => void;
  onNext: () => void;
}) {
  const validity = surgeryDateValidity(draft.surgery_date, { totalWeeks });
  const canContinue = required ? validity.canContinue : validity.state !== "future";

  return (
    <div>
      <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted text-primary">
        <CalendarDays className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-center text-3xl font-bold leading-tight">
        Quando foi a sua cirurgia?
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Todo o seu protocolo — exercícios, metas e marcos — é contado a partir dessa data.
      </p>

      <div className="mt-8">
        <Field label={required ? "Data da cirurgia" : "Data da cirurgia (opcional)"}>
          <Input
            type="date"
            max={todayISO()}
            value={draft.surgery_date ?? ""}
            onChange={(e) => onChange({ surgery_date: e.target.value })}
            className="h-14 text-lg"
          />
        </Field>
      </div>

      <div className="mt-4 min-h-[64px]">
        {validity.state === "ok" && (
          <div className="rounded-xl bg-primary-muted p-3.5 text-center">
            <p className="text-sm text-primary-dark">
              Você está na{" "}
              <span className="font-bold">
                semana {postOpWeekFromDays(validity.daysSinceSurgery ?? 0)}
              </span>{" "}
              do pós-operatório.
            </p>
          </div>
        )}
        {validity.state === "stale" && (
          <div className="flex items-start gap-2 rounded-xl bg-warning/10 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs leading-snug text-foreground/80">
              Essa data já passou do fim do protocolo ({totalWeeks} semanas). Se estiver certa, pode
              seguir — só confira antes.
            </p>
          </div>
        )}
        {validity.state === "future" && (
          <div className="flex items-start gap-2 rounded-xl bg-warning/10 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs leading-snug text-foreground/80">
              Essa data ainda não chegou. O acompanhamento começa depois da cirurgia.
            </p>
          </div>
        )}
        {validity.state === "missing" && required && (
          <p className="px-1 text-center text-xs text-muted-foreground">
            Precisamos dessa data para montar a sua semana 1.
          </p>
        )}
      </div>

      <Button size="lg" disabled={!canContinue} className="mt-4 w-full rounded-xl" onClick={onNext}>
        Continuar <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function StepSide({
  draft,
  onChange,
  onNext,
}: {
  draft: TreatmentOnboardingDraft;
  onChange: (v: TreatmentOnboardingDraft) => void;
  onNext: () => void;
}) {
  const side = draft.affected_side ?? "right";
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">Detalhes da lesão</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ajuda a separar tratamentos de membros diferentes.
      </p>
      <div className="mt-6 space-y-4">
        <Field label="Lado afetado">
          <div className="grid grid-cols-3 gap-2">
            {(["left", "right", "bilateral"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onChange({ affected_side: s as AffectedSide })}
                className={cn(
                  "rounded-xl border-2 p-3 text-sm font-medium",
                  side === s
                    ? "border-primary bg-primary-muted text-primary-dark"
                    : "border-border bg-card text-foreground",
                )}
              >
                {s === "left" ? "Esquerdo" : s === "right" ? "Direito" : "Ambos"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Apelido para esse tratamento (opcional)">
          <Input
            value={draft.nickname ?? ""}
            onChange={(e) => onChange({ nickname: e.target.value })}
            placeholder="Ex: Joelho direito"
            className="h-12"
          />
        </Field>
      </div>
      <Button size="lg" className="mt-8 w-full rounded-xl" onClick={onNext}>
        Continuar <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function StepDoctor({
  draft,
  onChange,
  onFinish,
}: {
  draft: TreatmentOnboardingDraft;
  onChange: (v: TreatmentOnboardingDraft) => void;
  onFinish: () => void;
}) {
  return (
    <div>
      <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted text-primary">
        <Stethoscope className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-center text-3xl font-bold leading-tight">Quem prescreveu?</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        O nome aparece no seu protocolo e no relatório que você compartilha.
      </p>
      <div className="mt-8 space-y-4">
        <Field label="Médico que prescreveu">
          <Input
            value={draft.prescribed_by ?? ""}
            onChange={(e) => onChange({ prescribed_by: e.target.value })}
            placeholder="Dr. Carlos Mendes"
            className="h-12"
          />
        </Field>
        {MVP_ASK_REMINDER && (
          <Field label="Horário do lembrete">
            <Input
              type="time"
              value={draft.reminder_time ?? "09:00"}
              onChange={(e) => onChange({ reminder_time: e.target.value })}
              className="h-14 text-2xl font-semibold"
            />
          </Field>
        )}
      </div>
      {MVP_ASK_REMINDER && (
        <div className="mt-3 rounded-xl bg-bg-subtle p-3 text-xs text-muted-foreground">
          <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-success" />
          No MVP, lembretes ainda não são enviados — sua escolha fica salva.
        </div>
      )}
      <Button size="lg" className="mt-8 w-full rounded-xl" onClick={onFinish}>
        Iniciar tratamento
      </Button>
    </div>
  );
}
