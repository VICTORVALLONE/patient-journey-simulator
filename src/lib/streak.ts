import { daysBetweenISODates, postOpWeekFromDays, todayISO } from "@/lib/entry";
import { sessionsPerWeekForWeek } from "@/lib/prescription";
import type { Protocol, Session } from "@/lib/types";

/**
 * Duas camadas de engajamento, com papéis distintos (decisão de 2026-07-28):
 *
 * - **Streak de DIAS** (`computeDayStreak`) — a camada base, visível desde o
 *   primeiro dia: dias consecutivos com a sessão do dia concluída. É a métrica
 *   certa para a fase inicial, em que a prescrição é diária.
 * - **Streak de SEMANAS** (`computeWeeklyStreak`) — só passa a contar a partir
 *   da semana pós-op 3 (`WEEKLY_STREAK_START_WEEK`). Antes disso "semanas
 *   consecutivas" não é uma sequência: na primeira semana de alguém o número
 *   só produz leitura esquisita (acender com 3/7 dias, ou punir com 6/7).
 *
 * **Regra do multi-dose, casada com a adesão:** itens com `times_per_day` (gelo
 * 3× ao dia etc.) NÃO multiplicam o streak. O dia conta **uma vez** — dias, não
 * doses — porque o app não captura doses (`times_per_day` é instrução exibida)
 * e o reducer garante no máximo 1 sessão por dia. As duas funções derivam tudo
 * de `scheduled_date`, então a regra vale por construção.
 */

/** Semana pós-op a partir da qual o streak semanal começa a valer. */
export const WEEKLY_STREAK_START_WEEK = 3;

export interface StreakPair {
  current: number;
  longest: number;
}

/**
 * Dias consecutivos com sessão concluída, terminando hoje — ou ontem: o dia
 * corrente ainda não feito não quebra a sequência ("nunca punir" vale para o
 * streak também; a quebra só se consuma quando o dia passa em branco).
 */
export function computeDayStreak(sessions: Session[], today: string = todayISO()): StreakPair {
  const days = Array.from(new Set(sessions.map((s) => s.scheduled_date))).sort();
  if (days.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = daysBetweenISODates(days[i - 1]!, days[i]!) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // `run` termina no último dia com sessão; ele só é o streak corrente se esse
  // dia for hoje (gap 0) ou ontem (gap 1, hoje pendente).
  const gapToToday = daysBetweenISODates(days[days.length - 1]!, today);
  return { current: gapToToday <= 1 ? run : 0, longest };
}

/**
 * Semanas pós-op consecutivas batendo a meta de frequência, contadas a partir
 * da `WEEKLY_STREAK_START_WEEK`.
 *
 * Duas correções sobre a versão anterior:
 * - **Âncora**: as semanas são as pós-operatórias (`surgery_date || started_at`,
 *   a MESMA âncora de `postOpWeekOf`), não semanas corridas desde o início do
 *   uso do app — senão o streak e a tela discordariam sobre que semana é.
 * - **Meta por semana**: `sessionsPerWeekForWeek` (guia clínico manda, fase é o
 *   padrão), não o `sessions_per_week` do protocolo — que é 3 e subestimava as
 *   fases 2–3, que pedem 4.
 *
 * A semana corrente (parcial) conta se já bateu a meta e não quebra a sequência
 * enquanto estiver em andamento.
 */
export function computeWeeklyStreak(
  sessions: Session[],
  protocol: Protocol,
  anchorISO: string,
  today: string = todayISO(),
): StreakPair {
  const weekOf = (dateISO: string) =>
    Math.min(postOpWeekFromDays(daysBetweenISODates(anchorISO, dateISO)), protocol.total_weeks);

  const currentWeek = weekOf(today);
  if (currentWeek < WEEKLY_STREAK_START_WEEK) return { current: 0, longest: 0 };

  const counts = new Map<number, number>();
  for (const s of sessions) {
    const w = weekOf(s.scheduled_date);
    if (w >= WEEKLY_STREAK_START_WEEK) counts.set(w, (counts.get(w) ?? 0) + 1);
  }

  let run = 0;
  let longest = 0;
  for (let w = WEEKLY_STREAK_START_WEEK; w <= currentWeek; w++) {
    const target = Math.max(1, sessionsPerWeekForWeek(protocol, w));
    if ((counts.get(w) ?? 0) >= target) {
      run += 1;
      longest = Math.max(longest, run);
    } else if (w < currentWeek) {
      // Semana passada sem meta batida quebra a sequência; a corrente, não.
      run = 0;
    }
  }
  return { current: run, longest };
}
