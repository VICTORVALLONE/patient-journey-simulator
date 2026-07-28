import { redirect } from "@tanstack/react-router";

import { entryStage, STAGE_ROUTE, type EntryStage } from "@/lib/entry";
import { usePatientStore } from "@/store/patient";

/**
 * Ponte entre a máquina de estágio (`lib/entry.ts`, pura) e os guards de rota.
 * Mora aqui, e não em `entry.ts`, para que a máquina siga testável sem store.
 *
 * **Guards só decidem no cliente.** No servidor a store é o seed de módulo, sem
 * localStorage: decidir ali seria decidir sobre o estado errado — e mandaria de
 * volta para `/welcome` quem já está no meio da jornada. Em produção isso não
 * abre buraco: o build é SPA (`vite.config.ts`), o shell é prerenderizado em
 * `/welcome` e o router só toma decisão depois de bootar no cliente. No `dev`
 * (SSR ao vivo) o guard vira no-op e o fallback em efeito, dentro da tela,
 * assume — é por isso que os dois existem.
 */
export function currentEntryStage(): EntryStage | null {
  if (typeof window === "undefined") return null;
  return entryStage(usePatientStore.getState());
}

/**
 * Redireciona quando o estágio atual não é um dos permitidos nesta rota.
 * Lança `redirect` — chamar dentro de `beforeLoad`.
 */
export function requireStage(allowed: EntryStage[]): void {
  const stage = currentEntryStage();
  if (!stage || allowed.includes(stage)) return;
  throw redirect({ to: STAGE_ROUTE[stage] });
}
