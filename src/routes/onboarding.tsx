import { createFileRoute, Outlet, useChildMatches, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, Dumbbell, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { usePatientStore } from "@/store/patient";
import type { PersonalOnboardingDraft } from "@/store/patient";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import type { RecoveryGoal } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Criar minha conta · FisioCare" }] }),
  component: OnboardingPage,
});

const GOAL_OPTIONS: { value: RecoveryGoal; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "sports", label: "Voltar aos esportes", desc: "Performance e retorno ao treino", icon: <Dumbbell className="h-6 w-6" /> },
  { value: "daily_life", label: "Vida cotidiana sem dor", desc: "Andar, subir escadas, sem incômodo", icon: <Footprints className="h-6 w-6" /> },
  { value: "work", label: "Retornar ao trabalho", desc: "Recuperar capacidade profissional", icon: <Briefcase className="h-6 w-6" /> },
];

function OnboardingPage() {
  const childMatches = useChildMatches();

  if (childMatches.length > 0) return <Outlet />;

  return <PersonalOnboardingPage />;
}

function PersonalOnboardingPage() {
  const hydrated = useHydratedStore();
  const navigate = useNavigate();
  const draft = usePatientStore((s) => s.onboardingDraft.user ?? {});
  const setPersonalDraft = usePatientStore((s) => s.setPersonalDraft);
  const completePersonalOnboarding = usePatientStore((s) => s.completePersonalOnboarding);

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  if (!hydrated)
    return (
      <MobileFrame withNav={false}>
        <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
      </MobileFrame>
    );

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
                className={cn("h-1 flex-1 rounded-full", i < step ? "bg-primary" : "bg-muted")}
              />
            ))}
          </div>
        </header>

        <div className="flex-1 px-5 pb-8">
          {step === 1 && (
            <StepName
              draft={draft}
              onChange={setPersonalDraft}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepBody
              draft={draft}
              onChange={setPersonalDraft}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepGoal
              value={draft.recovery_goal}
              onChange={(g) => setPersonalDraft({ recovery_goal: g })}
              onFinish={() => {
                completePersonalOnboarding();
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

function StepName({
  draft,
  onChange,
  onNext,
}: {
  draft: PersonalOnboardingDraft;
  onChange: (v: PersonalOnboardingDraft) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">Bem-vindo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vamos criar seu perfil. Depois você poderá iniciar um ou mais tratamentos.
      </p>
      <div className="mt-6 space-y-4">
        <Field label="Nome completo">
          <Input
            value={draft.name ?? ""}
            onChange={(e) => onChange({ name: e.target.value })}
            className="h-12"
            placeholder="Como devemos te chamar"
          />
        </Field>
      </div>
      <Button
        size="lg"
        disabled={!draft.name?.trim()}
        className="mt-8 w-full rounded-xl"
        onClick={onNext}
      >
        Continuar <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function StepBody({
  draft,
  onChange,
  onNext,
}: {
  draft: PersonalOnboardingDraft;
  onChange: (v: PersonalOnboardingDraft) => void;
  onNext: () => void;
}) {
  const canContinue = !!draft.birth_date && !!draft.weight_kg && !!draft.height_cm;
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">Sobre você</h1>
      <p className="mt-2 text-sm text-muted-foreground">Esses dados ajudam a personalizar seu plano.</p>
      <div className="mt-6 space-y-4">
        <Field label="Data de nascimento">
          <Input
            type="date"
            value={draft.birth_date ?? ""}
            onChange={(e) => onChange({ birth_date: e.target.value })}
            className="h-12"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso (kg)">
            <Input
              type="number"
              inputMode="decimal"
              value={draft.weight_kg ?? ""}
              onChange={(e) => onChange({ weight_kg: Number(e.target.value) })}
              className="h-12"
            />
          </Field>
          <Field label="Altura (cm)">
            <Input
              type="number"
              inputMode="numeric"
              value={draft.height_cm ?? ""}
              onChange={(e) => onChange({ height_cm: Number(e.target.value) })}
              className="h-12"
            />
          </Field>
        </div>
      </div>
      <Button size="lg" disabled={!canContinue} className="mt-8 w-full rounded-xl" onClick={onNext}>
        Continuar <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function StepGoal({
  value,
  onChange,
  onFinish,
}: {
  value?: RecoveryGoal;
  onChange: (g: RecoveryGoal) => void;
  onFinish: () => void;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">Seu objetivo principal</h1>
      <p className="mt-2 text-sm text-muted-foreground">Usamos isso para personalizar mensagens e metas.</p>
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
              <div
                className={cn(
                  "rounded-xl p-3",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
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
      <Button size="lg" disabled={!value} className="mt-8 w-full rounded-xl" onClick={onFinish}>
        Finalizar cadastro
      </Button>
    </div>
  );
}