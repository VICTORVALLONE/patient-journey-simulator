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
      { week: 4, average_pain: 4.2, session_count: 3 },
      { week: 8, average_pain: 2.1, session_count: 3 },
      { week: 12, average_pain: 0.6, session_count: 3 },
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
    sessions: [],
  };
})();

export function emptyWeeklyFrequency(): WeekFrequency[] {
  return EMPTY_WEEKLY.map((w) => ({ ...w }));
}