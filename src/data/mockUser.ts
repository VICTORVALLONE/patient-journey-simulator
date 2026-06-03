import type { BadgeId, PainEntry, Treatment, User, WeekFrequency } from "@/lib/types";
import type { Session } from "@/lib/types";
import { getProtocol, totalSessionsForProtocol } from "@/data/protocols";
import avatarAlexandre from "@/assets/avatar-alexandre.jpg";

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
  "phase_1_complete",
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

/** Demo: tratamento de LCA atualmente ativo na fase 2, ~67% concluído. */
export const MOCK_TREATMENT_LCA_ACTIVE: Treatment = {
  id: "tr_lca_active",
  user_id: MOCK_USER.id,
  nickname: "Joelho direito (LCA)",
  protocol_id: "proto_lca",
  injury_type: "lca",
  affected_side: "right",
  surgery_date: "2024-10-10",
  started_at: "2024-10-15",
  prescribed_by: "Dr. Carlos Mendes",
  reminder_time: "09:00",
  status: "active",
  current_phase: 2,
  phases_completed: [1],
  badges_unlocked: DEMO_BADGES_LCA,
  total_sessions_prescribed: 36,
  total_sessions_completed: 24,
  adherence_rate: 67,
  current_streak: 12,
  longest_streak: 12,
  pain_history: DEMO_PAIN_HISTORY,
  weekly_frequency: [
    { week_label: "Seg", sessions_done: 3, sessions_planned: 3 },
    { week_label: "Ter", sessions_done: 3, sessions_planned: 3 },
    { week_label: "Qua", sessions_done: 4, sessions_planned: 4 },
    { week_label: "Qui", sessions_done: 4, sessions_planned: 4 },
    { week_label: "Sex", sessions_done: 4, sessions_planned: 4 },
    { week_label: "Sáb", sessions_done: 3, sessions_planned: 4 },
    { week_label: "Dom", sessions_done: 3, sessions_planned: 3 },
  ],
  sessions: [],
};

/** Demo: tratamento de patelofemoral previamente concluído (histórico). */
export const MOCK_TREATMENT_PATELLO_DONE: Treatment = (() => {
  const protocol = getProtocol("proto_patellofemoral");
  const total = totalSessionsForProtocol(protocol);
  const startMs = new Date("2023-06-01T09:00:00Z").getTime();
  const endMs = new Date("2023-09-29T19:00:00Z").getTime();
  const NOTES = [
    "Senti menos dor ao subir escadas hoje.",
    "Joelho estalou no início, mas firmou.",
    "Conseguir manter a postura ficou mais fácil.",
    "VMO ativando bem, sem dor.",
    "Caminhei 30 minutos antes — sem incômodo.",
  ];
  const sessions: Session[] = [];
  let absoluteIdx = 0;
  for (const ph of protocol.phases) {
    const sessionsInPhase = ph.duration_weeks * ph.sessions_per_week;
    const exerciseIds = ph.exercises.map((e) => e.id);
    for (let s = 0; s < sessionsInPhase; s++) {
      const t = absoluteIdx / Math.max(1, total - 1);
      const ms = startMs + (endMs - startMs) * t;
      const date = new Date(ms);
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
        scheduled_date: date.toISOString().slice(0, 10),
        completed_at: date.toISOString(),
        exercises_completed: exerciseIds,
        pain_level: pain,
        difficulty_rating: diff,
        notes: absoluteIdx % 6 === 0 ? NOTES[absoluteIdx % NOTES.length] : undefined,
        duration_minutes: 22 + ((absoluteIdx * 3) % 14),
      });
      absoluteIdx++;
    }
  }
  // Most recent first.
  sessions.reverse();
  return {
    id: "tr_patello_done",
    user_id: MOCK_USER.id,
    nickname: "Joelho esquerdo (patelofemoral)",
    protocol_id: "proto_patellofemoral",
    injury_type: "patellofemoral",
    affected_side: "left",
    started_at: "2023-06-01",
    completed_at: "2023-09-30",
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
    longest_streak: 28,
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
      { week_label: "Seg", sessions_done: 3, sessions_planned: 3 },
      { week_label: "Ter", sessions_done: 0, sessions_planned: 0 },
      { week_label: "Qua", sessions_done: 3, sessions_planned: 3 },
      { week_label: "Qui", sessions_done: 0, sessions_planned: 0 },
      { week_label: "Sex", sessions_done: 3, sessions_planned: 3 },
      { week_label: "Sáb", sessions_done: 0, sessions_planned: 0 },
      { week_label: "Dom", sessions_done: 0, sessions_planned: 0 },
    ],
    sessions,
  };
})();

export function emptyWeeklyFrequency(): WeekFrequency[] {
  return EMPTY_WEEKLY.map((w) => ({ ...w }));
}