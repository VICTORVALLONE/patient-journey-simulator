import type { Treatment } from "@/lib/types";

/**
 * Máquina de estágio da jornada de entrada: cadastro → onboarding do tratamento
 * → boas-vindas → semana 1.
 *
 * Puro de propósito — sem React e sem importar a store, para que os guards de
 * rota (`beforeLoad`) possam chamá-lo com um snapshot síncrono e para que tudo
 * aqui seja testável sem montar componente.
 */
export type EntryStage = "welcome" | "personal" | "treatment" | "boas_vindas" | "ready";

export const STAGE_ROUTE: Record<EntryStage, string> = {
  welcome: "/welcome",
  personal: "/onboarding",
  treatment: "/onboarding/treatment",
  boas_vindas: "/boas-vindas",
  ready: "/home",
};

/** Recorte da store que o estágio precisa. Estrutural: a store real encaixa. */
export interface EntrySnapshot {
  isOnboarded: boolean;
  treatments: Treatment[];
  activeTreatmentId: string | null;
  onboardingDraft?: { user?: object };
}

export function activeTreatmentOf(s: EntrySnapshot): Treatment | null {
  if (!s.activeTreatmentId) return null;
  return s.treatments.find((t) => t.id === s.activeTreatmentId) ?? null;
}

/**
 * A tela de boas-vindas está pendente para este tratamento?
 *
 * Regra de vovô: um tratamento que já tem sessão concluída é anterior à própria
 * existência da tela — sem isso, todo localStorage já em uso (inclusive uma demo
 * em andamento) seria jogado para /boas-vindas na primeira carga depois do deploy.
 * É isso que permite esta feature não precisar de bump de versão do persist.
 */
export function isWelcomePending(t: Treatment | null): boolean {
  if (!t) return false;
  if (t.welcome_completed_at) return false;
  if (t.total_sessions_completed > 0) return false;
  return true;
}

export function entryStage(s: EntrySnapshot): EntryStage {
  if (!s.isOnboarded) {
    // Cadastro pessoal iniciado e abandonado: retoma de onde parou.
    const draft = s.onboardingDraft?.user;
    return draft && Object.keys(draft).length > 0 ? "personal" : "welcome";
  }
  const active = activeTreatmentOf(s);
  if (!active) return "treatment";
  if (isWelcomePending(active)) return "boas_vindas";
  return "ready";
}

// Data da cirurgia ----------------------------------------------------------

export type SurgeryDateState = "missing" | "future" | "stale" | "ok";

export interface SurgeryDateValidity {
  state: SurgeryDateState;
  /** Só `future` e `missing` travam o avanço; `stale` apenas avisa. */
  canContinue: boolean;
  /**
   * Dias decorridos desde a cirurgia. A derivação de SEMANA pós-op não mora
   * aqui de propósito: ela é de `postOpWeekOf` (spec 01), e o código já teve
   * três cálculos divergentes de semana — não vamos criar um quarto.
   */
  daysSinceSurgery?: number;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Diferença em dias entre duas datas ISO, imune a fuso e horário de verão.
 * Exportada para ser A cópia única: prescription e streak derivam daqui.
 */
export function daysBetweenISODates(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split("-").map(Number);
  const [ty, tm, td] = toISO.split("-").map(Number);
  const from = Date.UTC(fy!, fm! - 1, fd!);
  const to = Date.UTC(ty!, tm! - 1, td!);
  return Math.round((to - from) / 86_400_000);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Valida a data da cirurgia. Devolve estado, não texto: a cópia é decisão de
 * design e vive na tela (DESIGN.md reserva Vermelho Alerta para alerta clínico
 * — erro de digitação nunca é vermelho).
 *
 * @param totalWeeks duração do protocolo, para detectar data antiga demais.
 * @param today injetável para tornar o teste determinístico.
 */
export function surgeryDateValidity(
  iso: string | undefined | null,
  { totalWeeks, today = todayISO() }: { totalWeeks: number; today?: string },
): SurgeryDateValidity {
  if (!iso || !ISO_DATE.test(iso)) return { state: "missing", canContinue: false };

  const days = daysBetweenISODates(iso, today);
  if (Number.isNaN(days)) return { state: "missing", canContinue: false };

  if (days < 0) return { state: "future", canContinue: false, daysSinceSurgery: days };
  if (days > totalWeeks * 7) return { state: "stale", canContinue: true, daysSinceSurgery: days };
  return { state: "ok", canContinue: true, daysSinceSurgery: days };
}

/**
 * Semana pós-operatória 1-indexada a partir de dias decorridos: o dia da
 * cirurgia é o dia 1 da semana 1, e a semana vira a cada 7 dias.
 *
 * Este é o **único** cálculo de semana-por-data do código. `postOpWeekOf` da
 * spec 01 deve consumir este helper em vez de reimplementá-lo: o app já carrega
 * três cálculos divergentes de semana por *contagem de sessões* (que a spec 01
 * unifica) e um quarto, agora por data, seria a mesma dívida de novo.
 */
export function postOpWeekFromDays(days: number): number {
  return Math.max(1, Math.floor(days / 7) + 1);
}
