import type { Prescription, Progress, User } from "@/lib/types";

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
};

export const MOCK_PRESCRIPTION: Prescription = {
  id: "presc_001",
  user_id: "user_alexandre",
  protocol_id: "proto_lca",
  injury_type: "lca",
  affected_side: "right",
  surgery_date: "2024-10-10",
  start_date: "2024-10-15",
  prescribed_by: "Dr. Carlos Mendes",
  status: "active",
};

export const MOCK_PROGRESS: Progress = {
  user_id: "user_alexandre",
  total_sessions_prescribed: 36,
  total_sessions_completed: 24,
  adherence_rate: 67,
  current_streak: 12,
  longest_streak: 12,
  current_phase: 2,
  phases_completed: [1],
  badges_unlocked: ["first_session", "week_1", "sessions_10", "streak_7", "phase_1_complete"],
  pain_history: [
    { week: 1, average_pain: 7.5, session_count: 3 },
    { week: 2, average_pain: 6.8, session_count: 3 },
    { week: 3, average_pain: 5.9, session_count: 4 },
    { week: 4, average_pain: 5.2, session_count: 4 },
    { week: 5, average_pain: 4.1, session_count: 4 },
    { week: 6, average_pain: 3.4, session_count: 3 },
  ],
  weekly_frequency: [
    { week_label: "Seg", sessions_done: 3, sessions_planned: 3 },
    { week_label: "Ter", sessions_done: 3, sessions_planned: 3 },
    { week_label: "Qua", sessions_done: 4, sessions_planned: 4 },
    { week_label: "Qui", sessions_done: 4, sessions_planned: 4 },
    { week_label: "Sex", sessions_done: 4, sessions_planned: 4 },
    { week_label: "Sáb", sessions_done: 3, sessions_planned: 4 },
    { week_label: "Dom", sessions_done: 3, sessions_planned: 3 },
  ],
};

export const INITIAL_PROGRESS: Progress = {
  user_id: "user_alexandre",
  total_sessions_prescribed: 0,
  total_sessions_completed: 0,
  adherence_rate: 0,
  current_streak: 0,
  longest_streak: 0,
  current_phase: 1,
  phases_completed: [],
  badges_unlocked: [],
  pain_history: [],
  weekly_frequency: [
    { week_label: "Seg", sessions_done: 0, sessions_planned: 0 },
    { week_label: "Ter", sessions_done: 0, sessions_planned: 0 },
    { week_label: "Qua", sessions_done: 0, sessions_planned: 0 },
    { week_label: "Qui", sessions_done: 0, sessions_planned: 0 },
    { week_label: "Sex", sessions_done: 0, sessions_planned: 0 },
    { week_label: "Sáb", sessions_done: 0, sessions_planned: 0 },
    { week_label: "Dom", sessions_done: 0, sessions_planned: 0 },
  ],
};