import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { usePatientStore } from "@/store/patient";
import type { TreatmentOnboardingDraft } from "@/store/patient";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import { getProtocol, totalSessionsForProtocol } from "@/data/protocols";
import type { AffectedSide, InjuryType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/treatment")({
  head: () => ({ meta: [{ title: "Novo tratamento · FisioCare" }] }),
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

function TreatmentOnboardingPage() {
  const hydrated = useHydratedStore();
  const navigate = useNavigate();
  const isOnboarded = usePatientStore((s) => s.isOnboarded);
  const draft = usePatientStore((s) => s.onboardingDraft.treatment ?? EMPTY_TREATMENT_DRAFT);
  const setDraft = usePatientStore((s) => s.setTreatmentDraft);
  const startTreatment = usePatientStore((s) => s.startTreatment);

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (hydrated && !isOnboarded) {
      navigate({ to: "/welcome" });
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

  return (
    <MobileFrame withNav={false}>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center gap-3 p-4">
          <button
            onClick={() => (step === 1 ? navigate({ to: "/home" }) : setStep(step - 1))}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn("h-1 flex-1 rounded-full", i < step ? "bg-primary" : "bg-muted")}
              />
            ))}
          </div>
        </header>

        <div className="flex-1 px-5 pb-8">
          {step === 1 && (
            <StepInjury
              injury={injury}
              protocolName={protocol.name}
              totalWeeks={protocol.total_weeks}
              totalSessions={totalSessions}
              onChange={setDraft}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && <StepSide draft={draft} onChange={setDraft} onNext={() => setStep(3)} />}
          {step === 3 && (
            <StepDoctor
              draft={draft}
              onChange={setDraft}
              onFinish={() => {
                startTreatment();
                navigate({ to: "/home" });
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
        <Field label="Data da cirurgia (opcional)">
          <Input
            type="date"
            value={draft.surgery_date ?? ""}
            onChange={(e) => onChange({ surgery_date: e.target.value })}
            className="h-12"
          />
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
        <Bell className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-center text-3xl font-bold leading-tight">Quem prescreveu?</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        E quando devemos lembrar você das sessões.
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
        <Field label="Horário do lembrete">
          <Input
            type="time"
            value={draft.reminder_time ?? "09:00"}
            onChange={(e) => onChange({ reminder_time: e.target.value })}
            className="h-14 text-2xl font-semibold"
          />
        </Field>
      </div>
      <div className="mt-3 rounded-xl bg-bg-subtle p-3 text-xs text-muted-foreground">
        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-success" />
        No MVP, lembretes ainda não são enviados — sua escolha fica salva.
      </div>
      <Button size="lg" className="mt-8 w-full rounded-xl" onClick={onFinish}>
        Iniciar tratamento
      </Button>
    </div>
  );
}
