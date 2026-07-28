import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { MobileFrame } from "@/components/layout/MobileFrame";
import { clearAiDoctorHistory } from "@/lib/aiDoctorHistory";
import { lockDemo, unlockDemo } from "@/lib/demoMode";
import { usePatientStore } from "@/store/patient";

/**
 * O interruptor que separa o MVP do médico das ferramentas do operador — dentro
 * de um único build e de um único link.
 *
 * - `/demo` **destrava** este navegador e carrega o paciente-demo. É o link de
 *   uma tocada para mostrar um paciente adiantado, com evolução e conquistas.
 * - `/demo?sair=1` **trava** de volta, zera o prontuário e o histórico do coach,
 *   e devolve ao começo da jornada. É como se vê o app do jeito que o médico o
 *   recebe, sem precisar de aba anônima.
 *
 * Destravar é o que faz aparecer o atalho do demo no `/welcome` e a seção Demo
 * do `/profile` (ver `useDemoMode`). Sem passar por aqui, nada disso existe.
 *
 * **Search param, e não uma rota `/demo/sair`.** No roteamento flat-com-pontos
 * do TanStack, `demo.sair.tsx` aninharia sob esta rota e o `beforeLoad` do pai
 * rodaria primeiro — a saída cairia no `resetToDemo()` antes de existir.
 *
 * Entrar não é idempotente de propósito: reabrir `/demo` reinicia o demo, que é
 * o que se quer de um link de apresentação passado adiante.
 */
export const Route = createFileRoute("/demo")({
  head: () => ({ meta: [{ title: "Demo · FisioApp" }] }),
  // O parser de search do router já converte `?sair=1` no NÚMERO 1, não na
  // string "1" — comparar só com strings fazia a saída cair silenciosamente no
  // ramo de entrada e recarregar a demo.
  validateSearch: (search: Record<string, unknown>): { sair?: boolean } => ({
    sair:
      search.sair === true || search.sair === 1 || search.sair === "1" || search.sair === "true",
  }),
  beforeLoad: ({ search }) => {
    if (typeof window === "undefined") return;
    if (search.sair) {
      applyDemoExit();
      throw redirect({ to: "/welcome" });
    }
    applyDemoEntry();
    throw redirect({ to: "/home" });
  },
  component: DemoFallback,
});

function applyDemoEntry() {
  unlockDemo();
  usePatientStore.getState().resetToDemo();
}

function applyDemoExit() {
  lockDemo();
  usePatientStore.getState().startFreshSignup();
  // O histórico do coach mora fora da store e nenhum reset o alcançava: sem
  // isto, a conversa do paciente-demo seguiria para quem se cadastrasse depois.
  clearAiDoctorHistory();
}

/** Só alcançável no `dev` (SSR ao vivo), onde o `beforeLoad` acima é no-op. */
function DemoFallback() {
  const { sair } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (sair) {
      applyDemoExit();
      void navigate({ to: "/welcome" });
    } else {
      applyDemoEntry();
      void navigate({ to: "/home" });
    }
  }, [sair, navigate]);

  return (
    <MobileFrame withNav={false}>
      <div className="p-6 text-sm text-muted-foreground">
        {sair ? "Saindo da demonstração…" : "Abrindo a demonstração…"}
      </div>
    </MobileFrame>
  );
}
