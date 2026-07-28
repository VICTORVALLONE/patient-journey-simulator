import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { MobileFrame } from "@/components/layout/MobileFrame";
import { usePatientStore } from "@/store/patient";

/**
 * Link de uma tocada para o demo do Alexandre — é o que se manda ao médico.
 *
 * Existe porque, com a jornada real como default (`isOnboarded: false`), o
 * `/profile` deixou de ser a porta do demo: visitante novo não chega lá. Sobram
 * o link em `/welcome` e esta rota, que é a única colável numa mensagem.
 *
 * Não é idempotente de propósito: **reabrir `/demo` reinicia o demo**. É o que
 * se quer de um link de apresentação — o médico anterior mexeu, o próximo abre
 * limpo.
 */
export const Route = createFileRoute("/demo")({
  head: () => ({ meta: [{ title: "Demo · FisioApp" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    usePatientStore.getState().resetToDemo();
    throw redirect({ to: "/home" });
  },
  component: DemoFallback,
});

/** Só alcançável no `dev` (SSR ao vivo), onde o `beforeLoad` acima é no-op. */
function DemoFallback() {
  const navigate = useNavigate();
  const resetToDemo = usePatientStore((s) => s.resetToDemo);

  useEffect(() => {
    resetToDemo();
    void navigate({ to: "/home" });
  }, [resetToDemo, navigate]);

  return (
    <MobileFrame withNav={false}>
      <div className="p-6 text-sm text-muted-foreground">Abrindo a demonstração…</div>
    </MobileFrame>
  );
}
