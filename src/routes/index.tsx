import { createFileRoute, redirect } from "@tanstack/react-router";

import { STAGE_ROUTE } from "@/lib/entry";
import { currentEntryStage } from "@/lib/route-guards";

/**
 * A raiz não tem tela: ela roteia para o estágio da jornada de entrada.
 * No servidor não há estágio a ler (ver `route-guards.ts`), então cai em
 * `/welcome` — que é justamente o `maskPath` do prerender SPA.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const stage = currentEntryStage();
    throw redirect({ to: stage ? STAGE_ROUTE[stage] : "/welcome" });
  },
  component: () => null,
});
