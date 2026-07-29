import type { BadgeId, Treatment } from "@/lib/types";

export function checkNewBadges(treatment: Treatment, totalPhases: number): BadgeId[] {
  const has = new Set(treatment.badges_unlocked);
  const out: BadgeId[] = [];
  const add = (id: BadgeId) => {
    if (!has.has(id)) out.push(id);
  };
  const completed = treatment.total_sessions_completed;

  if (completed >= 1) add("first_session");
  if (completed >= 7) add("week_1");
  if (completed >= 10) add("sessions_10");
  // Marcos de dias: seguidos (streak) e completos (total). O guard de 1 sessão
  // por dia torna `completed` == dias completos.
  if ((treatment.current_day_streak ?? 0) >= 10) add("streak_days_10");
  if (completed >= 20) add("days_complete_20");
  // Streak em semanas consecutivas batendo a meta — só conta a partir da
  // semana pós-op 3 (lib/streak.ts).
  if (treatment.current_streak >= 3) add("streak_7");
  if (treatment.current_streak >= 8) add("streak_21");

  for (const phase of treatment.phases_completed) {
    const id = `phase_${phase}_complete` as BadgeId;
    add(id);
  }

  const pct = treatment.total_sessions_prescribed
    ? completed / treatment.total_sessions_prescribed
    : 0;
  if (pct >= 0.5) add("halfway");
  if (treatment.total_sessions_prescribed > 0 && completed >= treatment.total_sessions_prescribed) {
    add("protocol_complete");
  }
  return out.filter((id) => {
    const m = id.match(/^phase_(\d)_complete$/);
    if (!m) return true;
    return Number(m[1]) <= totalPhases;
  });
}
