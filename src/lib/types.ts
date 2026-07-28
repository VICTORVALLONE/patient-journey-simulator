export type InjuryType = "lca" | "meniscus" | "patellofemoral";
export type SessionPhase = "warmup" | "active" | "peak" | "rest";
export type BodyRegion = "joelho" | "quadril" | "tornozelo" | "core";
export type RecoveryGoal = "sports" | "daily_life" | "work";
export type AffectedSide = "left" | "right" | "bilateral";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  birth_date: string;
  weight_kg: number;
  height_cm: number;
  recovery_goal: RecoveryGoal;
  created_at: string;
  avatar_url?: string;
}

/**
 * Referência a um vídeo hospedado. Guardamos **ids, não URLs**: trocar embed por
 * HLS, mudar de pull zone ou de provedor não pode custar reescrever 43 literais.
 * A derivação de URL mora em `lib/video.ts`.
 */
export interface VideoRef {
  provider: "bunny";
  library_id: string;
  video_id: string; // GUID do Bunny
  poster_url?: string;
  duration_seconds?: number;
  /** "vídeo 22" da lista dos médicos — rastreabilidade clínica, não identificador técnico. */
  catalog_number?: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds: number;
  video_url: string;
  thumbnail_url: string;
  difficulty: 1 | 2 | 3;
  session_phase: SessionPhase;
  body_region: BodyRegion;
}

export interface ProtocolPhase {
  id: string;
  phase_number: number;
  name: string;
  duration_weeks: number;
  sessions_per_week: number;
  focus: string;
  exercises: Exercise[];
  doctor_message?: string;
}

// Clinical guide layered on top of a protocol (source: medical booklet / cartilha).
// Additive: nothing in the persisted store shape depends on it.
export interface WeekGuideEntry {
  week_start: number; // semana pós-op inicial do bloco (inclusive)
  week_end: number; // semana final do bloco (inclusive)
  rom_target_degrees?: number; // meta de flexão do joelho (ADM) do bloco, ex.: 90
  rom_target_label: string; // ex.: "Dobrar o joelho até 90°" | "Amplitude máxima"
  milestones: string[]; // marcos funcionais do bloco, ex.: "Andar sem muletas"
  caution?: string; // alerta de segurança específico do bloco
}

export interface ClinicalGuide {
  source_title: string;
  source_authors: string;
  safety_alert: string; // tríade de alerta (dor, inchaço, instabilidade)
  lag_sign_note: string; // sinal de Lag (inibição do quadríceps)
  return_to_sport_note: string;
  weeks: WeekGuideEntry[];
}

export interface Protocol {
  id: string;
  injury_type: InjuryType;
  name: string;
  total_weeks: number;
  sessions_per_week: number;
  phases: ProtocolPhase[];
  clinical_guide?: ClinicalGuide;
}

export interface Prescription {
  id: string;
  user_id: string;
  protocol_id: string;
  injury_type: InjuryType;
  affected_side: AffectedSide;
  surgery_date?: string;
  start_date: string;
  prescribed_by: string;
  status: "active" | "completed" | "paused";
}

export interface Session {
  id: string;
  treatment_id: string;
  phase_number: number;
  session_number: number;
  scheduled_date: string;
  completed_at?: string;
  exercises_completed: string[];
  pain_level?: number;
  difficulty_rating?: 1 | 2 | 3;
  notes?: string;
  duration_minutes?: number;
}

export type BadgeId =
  | "first_session"
  | "week_1"
  | "sessions_10"
  | "streak_7"
  | "streak_21"
  | "phase_1_complete"
  | "phase_2_complete"
  | "phase_3_complete"
  | "phase_4_complete"
  | "halfway"
  | "protocol_complete";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface PainEntry {
  week: number;
  average_pain: number;
  session_count: number;
}

export interface WeekFrequency {
  week_label: string;
  sessions_done: number;
  sessions_planned: number;
}

export interface Progress {
  user_id: string;
  total_sessions_prescribed: number;
  total_sessions_completed: number;
  adherence_rate: number;
  current_streak: number;
  longest_streak: number;
  current_phase: number;
  phases_completed: number[];
  badges_unlocked: BadgeId[];
  pain_history: PainEntry[];
  weekly_frequency: WeekFrequency[];
}

// A patient can have multiple treatments over time (active or completed).
// Each treatment owns its own prescription, protocol progress and sessions.
export interface Treatment {
  id: string;
  user_id: string;
  nickname: string; // ex: "Joelho direito (LCA)"
  protocol_id: string;
  injury_type: InjuryType;
  affected_side: AffectedSide;
  surgery_date?: string;
  started_at: string;
  completed_at?: string;
  prescribed_by: string;
  reminder_time?: string;
  status: "active" | "completed" | "paused";

  // Boas-vindas: carimbo de conclusão da tela (não de assistir ao vídeo).
  // Ausente + sessões > 0 = tratamento anterior à tela (ver isWelcomePending).
  welcome_completed_at?: string;

  // Progress indicators (per-treatment)
  current_phase: number;
  phases_completed: number[];
  badges_unlocked: BadgeId[];
  total_sessions_prescribed: number;
  total_sessions_completed: number;
  adherence_rate: number;
  current_streak: number;
  longest_streak: number;
  pain_history: PainEntry[];
  weekly_frequency: WeekFrequency[];

  sessions: Session[];
}
