import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, Briefcase, CheckCircle2, Dumbbell, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { ConfettiBurst } from "@/components/celebration/Confetti";
import { usePatientStore } from "@/store/patient";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import { getProtocol, totalSessionsForProtocol } from "@/data/protocols";
import type { InjuryType, RecoveryGoal } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Configurar minha recuperação · FisioCare" }],
  }),
  component: OnboardingPage,
});

const INJURY_OPTIONS: { value: InjuryType; label: string }[] = [
  { value: "lca", label: "Reconstrução de LCA" },
  { value: "meniscus", label: "Lesão de menisco" },
  { value: "patellofemoral", label: "Síndrome patelofemoral" },
];

const GOAL_OPTIONS: { value: RecoveryGoal; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "sports", label: "Voltar aos esportes", desc: "Performance e retorno ao treino", icon: <Dumbbell className="h-6 w-6" /> },
  { value: "daily_life", label: "Vida cotidiana sem dor", desc: "Andar, subir escadas, sem incômodo", icon: <Footprints className="h-6 w-6" /> },
  { value: "work", label: "Retornar ao trabalho", desc: "Recuperar capacidade profissional", icon: <Briefcase className="h-6 w-6" /> },
];

function OnboardingPage() {
  const hydrated = useHydratedStore();
  const navigate = useNavigate();
  const draft = usePatientStore((s) => s.onboardingDraft);
  const setDraft = usePatientStore((s) => s.setOnboardingDraft);
  const completeOnboarding = usePatientStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const injury = draft.injury_type ?? "lca";
  const protocol = useMemo(() => {
    const id = injury === "lca" ? "proto_lca" : injury === "meniscus" ? "proto_meniscus" : "proto_patellofemoral";
    return getProtocol(id);
  }, [injury]);

  if (!hydrated) return <MobileFrame withNav={false}><div className="p-6 text-sm text-muted-foreground">Carregando…</div></MobileFrame>;

  return (
    <MobileFrame withNav={false}>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center gap-3 p-4">
          <button
            onClick={() => (step === 1 ? navigate({ to: "/welcome" }) : setStep(step - 1))}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i < step ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
        </header>

        <div className="flex-1 px-5 pb-8">
          {step === 1 && (
            <Step1
              injury={injury}
              prescribedBy={draft.prescribed_by ?? "Dr. Carlos Mendes"}
              affectedSide={draft.affected_side ?? "right"}
              onChange={(v) => setDraft(v)}
              onNext={() => setStep(2)}
              protocolName={protocol.name}
              totalWeeks={protocol.total_weeks}
            />
          )}
          {step === 2 && (
            <Step2
              draft={draft}
              onChange={setDraft}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3
              value={draft.recovery_goal}
              onChange={(g) => setDraft({ recovery_goal: g })}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Step4
              protocolName={protocol.name}
              phases={protocol.phases.map((p) => ({ name: p.name, weeks: p.duration_weeks }))}
              totalSessions={totalSessionsForProtocol(protocol)}
              totalWeeks={protocol.total_weeks}
              onNext={() => setStep(5)}
            />
          )}
          {step === 5 && (
            <Step5
              reminderTime={draft.reminder_time ?? "09:00"}
              onChange={(v) => setDraft(v)}
              onFinish={() => {
                completeOnboarding();
                navigate({ to: "/home", search: { celebrate: 1 } as never });
              }}
            />
          )}
        </div>
      </div>
    </MobileFrame>
  );
}

function Step1(props: {
  injury: InjuryType;
  prescribedBy: string;
  affectedSide: "left" | "right" | "bilateral";
  onChange: (v: Partial<Parameters<typeof usePatientStore.getState>[0] extends never ? never : ReturnType<typeof usePatientStore.getState>["onboardingDraft"]>) => void;
  onNext: () => void;
  protocolName: string;
  totalWeeks: number;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight text-foreground">Seu protocolo está pronto</h1>
      <p className="mt-2 text-sm text-muted-foreground">Confirme as informações que recebemos do seu médico.</p>

      <div className="mt-6 space-y-4">
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Diagnóstico</Label>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {INJURY_OPTIONS.map((opt) => {
              const active = props.injury === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => props.onChange({ injury_type: opt.value })}
                  className={cn(
                    "rounded-2xl border-2 p-4 text-left transition-all",
                    active ? "border-primary bg-primary-muted" : "border-border bg-card",
                  )}
                >
                  <p className="font-semibold text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {opt.value === props.injury ? `${props.protocolName} · ${props.totalWeeks} semanas` : ""}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Lado afetado</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["left", "right", "bilateral"] as const).map((side) => (
              <button
                key={side}
                onClick={() => props.onChange({ affected_side: side })}
                className={cn(
                  "rounded-xl border-2 p-3 text-sm font-medium capitalize",
                  props.affectedSide === side
                    ? "border-primary bg-primary-muted text-primary-dark"
                    : "border-border bg-card text-foreground",
                )}
              >
                {side === "left" ? "Esquerdo" : side === "right" ? "Direito" : "Ambos"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="doctor" className="text-xs uppercase tracking-wide text-muted-foreground">Médico que prescreveu</Label>
          <Input
            id="doctor"
            value={props.prescribedBy}
            onChange={(e) => props.onChange({ prescribed_by: e.target.value })}
            className="mt-1 h-12"
          />
        </div>
      </div>

      <Button size="lg" className="mt-8 w-full rounded-xl" onClick={props.onNext}>
        Confirmar e continuar <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function Step2({
  draft,
  onChange,
  onNext,
}: {
  draft: ReturnType<typeof usePatientStore.getState>["onboardingDraft"];
  onChange: (v: ReturnType<typeof usePatientStore.getState>["onboardingDraft"]) => void;
  onNext: () => void;
}) {
  const canContinue = !!draft.name && !!draft.birth_date && !!draft.weight_kg && !!draft.height_cm;
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">Sobre você</h1>
      <p className="mt-2 text-sm text-muted-foreground">Esses dados ajudam a personalizar sua jornada.</p>
      <div className="mt-6 space-y-4">
        <Field label="Nome completo">
          <Input value={draft.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} className="h-12" />
        </Field>
        <Field label="Data de nascimento">
          <Input type="date" value={draft.birth_date ?? ""} onChange={(e) => onChange({ birth_date: e.target.value })} className="h-12" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso (kg)">
            <Input type="number" inputMode="decimal" value={draft.weight_kg ?? ""} onChange={(e) => onChange({ weight_kg: Number(e.target.value) })} className="h-12" />
          </Field>
          <Field label="Altura (cm)">
            <Input type="number" inputMode="numeric" value={draft.height_cm ?? ""} onChange={(e) => onChange({ height_cm: Number(e.target.value) })} className="h-12" />
          </Field>
        </div>
        <Field label="Data da cirurgia (opcional)">
          <Input type="date" value={draft.surgery_date ?? ""} onChange={(e) => onChange({ surgery_date: e.target.value })} className="h-12" />
        </Field>
      </div>
      <Button size="lg" disabled={!canContinue} className="mt-8 w-full rounded-xl" onClick={onNext}>
        Continuar <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
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

function Step3({
  value,
  onChange,
  onNext,
}: {
  value?: RecoveryGoal;
  onChange: (g: RecoveryGoal) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">Qual é o seu objetivo?</h1>
      <p className="mt-2 text-sm text-muted-foreground">Vamos usar isso para te motivar nos dias difíceis.</p>
      <div className="mt-6 space-y-3">
        {GOAL_OPTIONS.map((g) => {
          const active = value === g.value;
          return (
            <button
              key={g.value}
              onClick={() => onChange(g.value)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                active ? "border-primary bg-primary-muted" : "border-border bg-card",
              )}
            >
              <div className={cn("rounded-xl p-3", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                {g.icon}
              </div>
              <div>
                <p className="font-semibold text-foreground">{g.label}</p>
                <p className="text-xs text-muted-foreground">{g.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
      <Button size="lg" disabled={!value} className="mt-8 w-full rounded-xl" onClick={onNext}>
        Continuar <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function Step4({
  protocolName,
  phases,
  totalSessions,
  totalWeeks,
  onNext,
}: {
  protocolName: string;
  phases: { name: string; weeks: number }[];
  totalSessions: number;
  totalWeeks: number;
  onNext: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">Seu caminho de recuperação</h1>
      <p className="mt-2 text-sm text-muted-foreground">{protocolName}</p>
      <div className="mt-6 space-y-2">
        {phases.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted text-sm font-bold text-primary">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.weeks} semanas</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-primary-muted p-4">
        <p className="text-sm font-semibold text-primary-dark">{totalSessions} sessões em {totalWeeks} semanas</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-white">
          <div className="h-full w-0 rounded-full bg-primary" />
        </div>
        <p className="mt-1 text-xs text-primary-dark">0% concluído — começa hoje.</p>
      </div>
      <Button size="lg" className="mt-8 w-full rounded-xl" onClick={onNext}>
        Estou pronto <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function Step5({
  reminderTime,
  onChange,
  onFinish,
}: {
  reminderTime: string;
  onChange: (v: { reminder_time?: string; notifications_enabled?: boolean }) => void;
  onFinish: () => void;
}) {
  return (
    <div>
      <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted text-primary">
        <Bell className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-center text-3xl font-bold leading-tight">Quando lembramos você?</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Pacientes que recebem lembretes têm 2x mais adesão.
      </p>
      <div className="mt-8">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Horário preferido</Label>
        <Input
          type="time"
          value={reminderTime}
          onChange={(e) => onChange({ reminder_time: e.target.value })}
          className="mt-1 h-14 text-2xl font-semibold"
        />
      </div>
      <div className="mt-3 rounded-xl bg-bg-subtle p-3 text-xs text-muted-foreground">
        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-success" />
        No MVP, lembretes ainda não são enviados — sua escolha fica salva para quando habilitarmos.
      </div>
      <Button
        size="lg"
        className="mt-8 w-full rounded-xl"
        onClick={() => {
          onChange({ notifications_enabled: true });
          onFinish();
        }}
      >
        Ativar lembretes
      </Button>
      <button
        type="button"
        onClick={() => {
          onChange({ notifications_enabled: false });
          onFinish();
        }}
        className="mt-4 block w-full text-center text-sm text-muted-foreground"
      >
        Agora não
      </button>
      <ConfettiBurst trigger={false} />
    </div>
  );
}