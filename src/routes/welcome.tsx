import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { usePatientStore } from "@/store/patient";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Bem-vindo ao FisioCare" },
      { name: "description", content: "Sua jornada de recuperação começa aqui." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const resetToDemo = usePatientStore((s) => s.resetToDemo);

  return (
    <MobileFrame withNav={false}>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-navy via-primary-dark to-primary text-primary-foreground">
        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="pt-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Indicado por seu médico
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Sua fisioterapia, no seu ritmo.
            </h1>
            <p className="mt-3 text-base text-white/80">
              O FisioCare guia sua recuperação entre as consultas com vídeos, lembretes e
              acompanhamento clínico do seu progresso.
            </p>
          </div>

          <div className="space-y-3 py-8">
            <Feature
              icon={<Activity className="h-5 w-5" />}
              title="Protocolo personalizado"
              desc="Exercícios definidos pela sua lesão."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Baseado em evidência"
              desc="Conteúdo validado por equipe médica."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Acompanhamento real"
              desc="Veja sua dor reduzir semana a semana."
            />
          </div>

          <div className="space-y-3 pb-8">
            <Button
              size="lg"
              className="w-full rounded-xl bg-white text-primary hover:bg-white/90"
              onClick={() => navigate({ to: "/onboarding" })}
            >
              Começar minha recuperação
            </Button>
            <button
              type="button"
              onClick={() => {
                resetToDemo();
                navigate({ to: "/home" });
              }}
              className="block w-full text-center text-sm text-white/80 underline-offset-2 hover:underline"
            >
              Continuar como Alexandre (demo)
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
      <div className="rounded-xl bg-white/15 p-2 text-white">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-white/75">{desc}</p>
      </div>
    </div>
  );
}
