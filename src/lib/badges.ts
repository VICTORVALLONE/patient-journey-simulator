import type { BadgeId, Progress } from "@/lib/types";

export function checkNewBadges(progress: Progress, totalPhases: number): BadgeId[] {
  const has = new Set(progress.badges_unlocked);
  const out: BadgeId[] = [];
  const add = (id: BadgeId) => {
    if (!has.has(id)) out.push(id);
  };
  const completed = progress.total_sessions_completed;

  if (completed >= 1) add("first_session");
  if (completed >= 7) add("week_1");
  if (completed >= 10) add("sessions_10");
  if (progress.current_streak >= 7) add("streak_7");
  if (progress.current_streak >= 21) add("streak_21");

  for (const phase of progress.phases_completed) {
    const id = `phase_${phase}_complete` as BadgeId;
    add(id);
  }

  const pct = progress.total_sessions_prescribed
    ? completed / progress.total_sessions_prescribed
    : 0;
  if (pct >= 0.5) add("halfway");
  if (
    progress.total_sessions_prescribed > 0 &&
    completed >= progress.total_sessions_prescribed
  ) {
    add("protocol_complete");
  }
  // totalPhases used to avoid awarding non-existent phase badges (e.g. phase_4 for non-LCA)
  return out.filter((id) => {
    const m = id.match(/^phase_(\d)_complete$/);
    if (!m) return true;
    return Number(m[1]) <= totalPhases;
  });
}