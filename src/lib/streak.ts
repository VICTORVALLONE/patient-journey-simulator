import type { Session } from "@/lib/types";
import { getProtocol } from "@/data/protocols";

const WEEK_MS = 7 * 86400000;

function toDate(dateOnly: string): Date {
  return new Date(`${dateOnly}T00:00:00`);
}

/**
 * Streak honesto para reabilitação: semanas consecutivas batendo a meta de
 * frequência do protocolo (sessions_per_week), terminando na semana corrente.
 * A semana corrente (parcial) conta se já bateu a meta e não quebra a
 * sequência enquanto ainda estiver em andamento.
 */
export function computeWeeklyStreak(
  sessions: Session[],
  protocolId: string,
  startedAt: string,
): { current: number; longest: number } {
  const start = toDate(startedAt);
  if (Number.isNaN(start.getTime()) || sessions.length === 0) return { current: 0, longest: 0 };

  const target = Math.max(1, getProtocol(protocolId).sessions_per_week || 3);
  const weekOf = (dateOnly: string) =>
    Math.floor((toDate(dateOnly).getTime() - start.getTime()) / WEEK_MS);

  const counts = new Map<number, number>();
  for (const s of sessions) {
    const w = weekOf(s.scheduled_date);
    if (w >= 0) counts.set(w, (counts.get(w) ?? 0) + 1);
  }

  const currentWeek = Math.max(0, weekOf(new Date().toISOString().slice(0, 10)));
  let run = 0;
  let longest = 0;
  for (let w = 0; w <= currentWeek; w++) {
    const met = (counts.get(w) ?? 0) >= target;
    if (met) {
      run += 1;
      longest = Math.max(longest, run);
    } else if (w < currentWeek) {
      // Semana passada sem meta batida quebra a sequência; a corrente, não.
      run = 0;
    }
  }
  return { current: run, longest };
}
