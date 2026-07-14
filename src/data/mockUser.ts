import type { BadgeId, PainEntry, Protocol, Treatment, User, WeekFrequency } from "@/lib/types";
import type { Session } from "@/lib/types";
import { getProtocol, totalSessionsForProtocol } from "@/data/protocols";
import { computeWeeklyStreak } from "@/lib/streak";
import avatarAlexandre from "@/assets/avatar-alexandre.jpg";

// --- Helpers (1 sessão por dia, respeitando spw) ---------------------------

const WEEK_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

function isoDayMon1(d: Date): number {
  return ((d.getDay() + 6) % 7) + 1;
}

function patternWeekdays(spw: number): number[] {
  switch (spw) {
    case 1:
      return [3];
    case 2:
      return [2, 4];
    case 3:
      return [1, 3, 5];
    case 4:
      return [1, 2, 4, 5];
    case 5:
      return [1, 2, 3, 4, 5];
    case 6:
      return [1, 2, 3, 4, 5, 6];
    default:
      return [1, 2, 3, 4, 5, 6, 7].slice(0, spw);
  }
}

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Fase e número da sessão (dentro da fase) para o índice global 0-based,
// derivados das contagens reais do protocolo (evita hardcodar fase no mock).
function phaseInfoForIndex(
  protocol: Protocol,
  globalIdx: number,
): { phase_number: number; session_number: number } {
  let remaining = globalIdx;
  for (const ph of protocol.phases) {
    const count = ph.duration_weeks * ph.sessions_per_week;
    if (remaining < count) return { phase_number: ph.phase_number, session_number: remaining + 1 };
    remaining -= count;
  }
  const last = protocol.phases[protocol.phases.length - 1]!;
  return {
    phase_number: last.phase_number,
    session_number: last.duration_weeks * last.sessions_per_week,
  };
}

// Estado de fase derivado de N sessões concluídas: fase atual (a da próxima
// sessão) e as fases já totalmente concluídas.
function derivePhaseState(
  protocol: Protocol,
  completed: number,
): { currentPhase: number; phasesCompleted: number[] } {
  const phasesCompleted: number[] = [];
  let cum = 0;
  for (const ph of protocol.phases) {
    cum += ph.duration_weeks * ph.sessions_per_week;
    if (completed >= cum) phasesCompleted.push(ph.phase_number);
  }
  const currentPhase = phaseInfoForIndex(protocol, completed).phase_number;
  return { currentPhase, phasesCompleted };
}

function datesBackward(endDate: Date, count: number, spw: number): Date[] {
  const days = new Set(patternWeekdays(spw));
  const result: Date[] = [];
  const cur = new Date(endDate);
  let safety = count * 30 + 30;
  while (result.length < count && safety-- > 0) {
    if (days.has(isoDayMon1(cur))) result.push(new Date(cur));
    cur.setDate(cur.getDate() - 1);
  }
  return result.reverse();
}

function datesForwardFromDate(start: Date, count: number, spw: number): Date[] {
  const days = new Set(patternWeekdays(spw));
  const result: Date[] = [];
  const cur = new Date(start);
  let safety = count * 30 + 30;
  while (result.length < count && safety-- > 0) {
    if (days.has(isoDayMon1(cur))) result.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function weeklyFrequencyForCurrentWeek(sessions: Session[], spw: number): WeekFrequency[] {
  const today = new Date();
  const offsetToMonday = isoDayMon1(today) - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - offsetToMonday);
  monday.setHours(0, 0, 0, 0);
  const days = new Set(patternWeekdays(spw));
  const doneISO = new Set(sessions.map((s) => s.scheduled_date));
  return WEEK_LABELS.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const iso = dateOnly(d);
    const planned = days.has(idx + 1) ? 1 : 0;
    const done = doneISO.has(iso) ? 1 : 0;
    return { week_label: label, sessions_done: done, sessions_planned: planned };
  });
}

export const MOCK_USER: User = {
  id: "user_alexandre",
  name: "Alexandre Silva",
  phone: "+55 11 99999-0000",
  email: "alexandre@email.com",
  birth_date: "1990-03-15",
  weight_kg: 78,
  height_cm: 182,
  recovery_goal: "sports",
  created_at: "2024-10-15T10:00:00Z",
  avatar_url: avatarAlexandre,
};

const EMPTY_WEEKLY: WeekFrequency[] = [
  { week_label: "Seg", sessions_done: 0, sessions_planned: 0 },
  { week_label: "Ter", sessions_done: 0, sessions_planned: 0 },
  { week_label: "Qua", sessions_done: 0, sessions_planned: 0 },
  { week_label: "Qui", sessions_done: 0, sessions_planned: 0 },
  { week_label: "Sex", sessions_done: 0, sessions_planned: 0 },
  { week_label: "Sáb", sessions_done: 0, sessions_planned: 0 },
  { week_label: "Dom", sessions_done: 0, sessions_planned: 0 },
];

const DEMO_PAIN_HISTORY: PainEntry[] = [
  { week: 1, average_pain: 7.5, session_count: 3 },
  { week: 2, average_pain: 6.8, session_count: 3 },
  { week: 3, average_pain: 5.9, session_count: 4 },
  { week: 4, average_pain: 5.2, session_count: 4 },
  { week: 5, average_pain: 4.1, session_count: 4 },
  { week: 6, average_pain: 3.4, session_count: 3 },
];

const DEMO_BADGES_LCA: BadgeId[] = [
  "first_session",
  "week_1",
  "sessions_10",
  "streak_7",
  "streak_21",
  "phase_1_complete",
  "phase_2_complete",
];

const DEMO_BADGES_PATELLO: BadgeId[] = [
  "first_session",
  "week_1",
  "sessions_10",
  "streak_7",
  "streak_21",
  "halfway",
  "phase_1_complete",
  "phase_2_complete",
  "phase_3_complete",
  "protocol_complete",
];

/** Demo: LCA ativo, 24 sessões concluídas (fase/semana derivadas do protocolo). */
export const MOCK_TREATMENT_LCA_ACTIVE: Treatment = (() => {
  const lcaProtocol = getProtocol("proto_lca");
  const COMPLETED = 24;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(9, 0, 0, 0);
  const dates = datesBackward(yesterday, COMPLETED, 3);
  const startedAt = dates[0] ?? yesterday;
  const NOTES = [
    "Inchaço menor hoje.",
    "Joelho mais estável ao final.",
    "Consegui completar todas as séries.",
    "Amplitude melhorou.",
    "Sem dor durante os exercícios.",
  ];
  const sessions: Session[] = dates.map((d, i) => {
    const { phase_number, session_number } = phaseInfoForIndex(lcaProtocol, i);
    const t = i / (COMPLETED - 1);
    const pain = Math.max(0, Math.round((7.5 - 5 * t + ((i * 7) % 5) / 10) * 10) / 10);
    const diff: 1 | 2 | 3 = t < 0.33 ? 3 : t < 0.7 ? 2 : 1;
    const dt = new Date(d);
    dt.setHours(9 + (i % 4), (i * 13) % 60, 0, 0);
    return {
      id: `sess_lca_${i}`,
      treatment_id: "tr_lca_active",
      phase_number,
      session_number,
      scheduled_date: dateOnly(dt),
      completed_at: dt.toISOString(),
      exercises_completed: [],
      pain_level: pain,
      difficulty_rating: diff,
      notes: i % 5 === 0 ? NOTES[i % NOTES.length] : undefined,
      duration_minutes: 22 + ((i * 3) % 14),
    };
  });
  sessions.reverse();

  // Streak, fase e total derivados dos dados reais — sem hardcode incoerente.
  const streak = computeWeeklyStreak(sessions, "proto_lca", dateOnly(startedAt));
  const { currentPhase, phasesCompleted } = derivePhaseState(lcaProtocol, COMPLETED);

  return {
    id: "tr_lca_active",
    user_id: MOCK_USER.id,
    nickname: "Joelho direito (LCA)",
    protocol_id: "proto_lca",
    injury_type: "lca",
    affected_side: "right",
    surgery_date: dateOnly(new Date(startedAt.getTime() - 5 * 86400000)),
    started_at: dateOnly(startedAt),
    prescribed_by: "Dr. Carlos Mendes",
    reminder_time: "09:00",
    status: "active",
    current_phase: currentPhase,
    phases_completed: phasesCompleted,
    badges_unlocked: DEMO_BADGES_LCA,
    total_sessions_prescribed: totalSessionsForProtocol(lcaProtocol),
    total_sessions_completed: COMPLETED,
    adherence_rate: 67,
    current_streak: streak.current,
    longest_streak: streak.longest,
    pain_history: DEMO_PAIN_HISTORY,
    weekly_frequency: weeklyFrequencyForCurrentWeek(sessions, 3),
    sessions,
  };
})();

/** Demo: tratamento de patelofemoral previamente concluído (histórico). */
export const MOCK_TREATMENT_PATELLO_DONE: Treatment = (() => {
  const protocol = getProtocol("proto_patellofemoral");
  const total = totalSessionsForProtocol(protocol);
  const NOTES = [
    "Senti menos dor ao subir escadas hoje.",
    "Joelho estalou no início, mas firmou.",
    "Conseguir manter a postura ficou mais fácil.",
    "VMO ativando bem, sem dor.",
    "Caminhei 30 minutos antes — sem incômodo.",
  ];
  const startDate = new Date("2023-06-05T09:00:00Z"); // segunda-feira
  const sessions: Session[] = [];
  let absoluteIdx = 0;
  let phaseCursor = new Date(startDate);
  for (const ph of protocol.phases) {
    const sessionsInPhase = ph.duration_weeks * ph.sessions_per_week;
    const exerciseIds = ph.exercises.map((e) => e.id);
    const phaseDates = datesForwardFromDate(phaseCursor, sessionsInPhase, ph.sessions_per_week);
    for (let s = 0; s < sessionsInPhase; s++) {
      const t = absoluteIdx / Math.max(1, total - 1);
      const date = new Date(phaseDates[s]!);
      date.setHours(9 + ((s + absoluteIdx) % 9), (absoluteIdx * 17) % 60, 0, 0);
      // Pain decreases from ~6.5 to ~0.3 over time, with small noise.
      const basePain = 6.5 * (1 - t);
      const noise = ((absoluteIdx * 7) % 5) / 10; // 0..0.4
      const pain = Math.max(0, Math.min(10, Math.round((basePain + noise) * 10) / 10));
      const diff: 1 | 2 | 3 = t < 0.33 ? 3 : t < 0.7 ? 2 : 1;
      sessions.push({
        id: `sess_patello_${absoluteIdx}`,
        treatment_id: "tr_patello_done",
        phase_number: ph.phase_number,
        session_number: s + 1,
        scheduled_date: dateOnly(date),
        completed_at: date.toISOString(),
        exercises_completed: exerciseIds,
        pain_level: pain,
        difficulty_rating: diff,
        notes: absoluteIdx % 6 === 0 ? NOTES[absoluteIdx % NOTES.length] : undefined,
        duration_minutes: 22 + ((absoluteIdx * 3) % 14),
      });
      absoluteIdx++;
    }
    const last = phaseDates[phaseDates.length - 1];
    if (last) {
      phaseCursor = new Date(last);
      phaseCursor.setDate(phaseCursor.getDate() + 1);
    }
  }
  const completedAt = sessions[sessions.length - 1]?.completed_at?.slice(0, 10) ?? "2023-09-30";
  // Most recent first.
  sessions.reverse();
  return {
    id: "tr_patello_done",
    user_id: MOCK_USER.id,
    nickname: "Joelho esquerdo (patelofemoral)",
    protocol_id: "proto_patellofemoral",
    injury_type: "patellofemoral",
    affected_side: "left",
    started_at: dateOnly(startDate),
    completed_at: completedAt,
    prescribed_by: "Dra. Marina Costa",
    reminder_time: "19:00",
    status: "completed",
    current_phase: protocol.phases.length,
    phases_completed: protocol.phases.map((p) => p.phase_number),
    badges_unlocked: DEMO_BADGES_PATELLO,
    total_sessions_prescribed: total,
    total_sessions_completed: total,
    adherence_rate: 100,
    current_streak: 0,
    longest_streak: 12,
    pain_history: [
      { week: 1, average_pain: 6.4, session_count: 3 },
      { week: 2, average_pain: 5.9, session_count: 3 },
      { week: 3, average_pain: 5.2, session_count: 3 },
      { week: 4, average_pain: 4.6, session_count: 4 },
      { week: 5, average_pain: 4.0, session_count: 4 },
      { week: 6, average_pain: 3.4, session_count: 4 },
      { week: 7, average_pain: 2.8, session_count: 4 },
      { week: 8, average_pain: 2.1, session_count: 4 },
      { week: 9, average_pain: 1.6, session_count: 3 },
      { week: 10, average_pain: 1.2, session_count: 3 },
      { week: 11, average_pain: 0.8, session_count: 3 },
      { week: 12, average_pain: 0.4, session_count: 3 },
    ],
    weekly_frequency: [
      { week_label: "Seg", sessions_done: 0, sessions_planned: 1 },
      { week_label: "Ter", sessions_done: 0, sessions_planned: 0 },
      { week_label: "Qua", sessions_done: 0, sessions_planned: 1 },
      { week_label: "Qui", sessions_done: 0, sessions_planned: 0 },
      { week_label: "Sex", sessions_done: 0, sessions_planned: 1 },
      { week_label: "Sáb", sessions_done: 0, sessions_planned: 0 },
      { week_label: "Dom", sessions_done: 0, sessions_planned: 0 },
    ],
    sessions,
  };
})();

export function emptyWeeklyFrequency(): WeekFrequency[] {
  return EMPTY_WEEKLY.map((w) => ({ ...w }));
}
