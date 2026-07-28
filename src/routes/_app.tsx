import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import { entryStage, STAGE_ROUTE } from "@/lib/entry";
import { requireStage } from "@/lib/route-guards";
import { usePatientStore } from "@/store/patient";

/**
 * Layout do app já onboardado. O guard vale para **toda** rota `_app.*` —
 * `beforeLoad` corre de cima para baixo na árvore, então `/session/today` num
 * refresh duro já é interceptado aqui, antes de qualquer render. É por isso que
 * as rotas filhas não repetem o guard: guard duplicado é guard que sai de sincronia.
 *
 * `treatment` entra na lista de permitidos junto com `ready`: "sem tratamento
 * ativo" é estado legítimo do app (quem concluiu o último tratamento, e o botão
 * de reset da seção Demo), e a home já o atende com `EmptyTreatmentState`. Quem
 * empurra o recém-cadastrado para o onboarding de tratamento é a navegação
 * explícita da jornada, não este guard — o guard existe para barrar visitante
 * não cadastrado e para segurar a semana 1 atrás das boas-vindas.
 */
const ALLOWED_STAGES = ["ready", "treatment"] as const;

export const Route = createFileRoute("/_app")({
  beforeLoad: () => requireStage([...ALLOWED_STAGES]),
  component: AppLayout,
});

function AppLayout() {
  const hydrated = useHydratedStore();
  const navigate = useNavigate();
  // Fallback do `dev` (SSR ao vivo, onde o guard é no-op) e de qualquer mudança
  // de estágio que aconteça com a tela já montada — sair do último tratamento,
  // por exemplo. Em produção o guard resolve antes daqui.
  const stage = usePatientStore((s) =>
    entryStage({
      isOnboarded: s.isOnboarded,
      treatments: s.treatments,
      activeTreatmentId: s.activeTreatmentId,
      onboardingDraft: s.onboardingDraft,
    }),
  );

  const allowed = (ALLOWED_STAGES as readonly string[]).includes(stage);

  useEffect(() => {
    if (hydrated && !allowed) {
      void navigate({ to: STAGE_ROUTE[stage] });
    }
  }, [hydrated, allowed, stage, navigate]);

  return (
    <MobileFrame>
      {hydrated && allowed ? (
        <Outlet />
      ) : (
        <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
          Carregando…
        </div>
      )}
      <BottomNav />
    </MobileFrame>
  );
}
