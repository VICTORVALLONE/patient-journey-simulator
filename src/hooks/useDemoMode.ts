import { useEffect, useState } from "react";

import { isDemoUnlocked } from "@/lib/demoMode";

/**
 * Modo demo para **render**. Sempre `false` no servidor e no primeiro render do
 * cliente; vira no efeito.
 *
 * O atraso de um frame é obrigatório, não descuido. `/welcome` é o `maskPath`
 * do prerender SPA (`vite.config.ts`): o HTML publicado é aquela tela
 * renderizada sem estado nenhum. Ler `isDemoUnlocked()` durante o render faria
 * o servidor dizer `false` e o cliente já dizer `true`, que é erro de
 * hidratação do React na primeira tela do app. Gatear com `useHydratedStore`
 * seria pior: poria um "Carregando…" na porta de entrada.
 *
 * Divisão de trabalho, espelhando `entry.ts` / `route-guards.ts`:
 * `beforeLoad` usa `isDemoUnlocked()`; componente usa **só** este hook.
 */
export function useDemoMode(): boolean {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    setUnlocked(isDemoUnlocked());
  }, []);
  return unlocked;
}
