import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  MOCK_USER,
  MOCK_TREATMENT_LCA_ACTIVE,
  MOCK_TREATMENT_PATELLO_DONE,
  emptyWeeklyFrequency,
} from "@/data/mockUser";
import { getProtocol, totalSessionsForProtocol } from "@/data/protocols";
import { checkNewBadges } from "@/lib/badges";
import type {
  AffectedSide,
  BadgeId,
  InjuryType,
  ProtocolPhase,
  RecoveryGoal,
  Session,
  SessionPhase,
  Treatment,
  User,
} from "@/lib/types";

export interface PersonalOnboardingDraft {
  name?: string;
  birth_date?: string;
  weight_kg?: number;
  height_cm?: number;
  recovery_goal?: RecoveryGoal;
}

export interface TreatmentOnboardingDraft {
  injury_type?: InjuryType;
  affected_side?: AffectedSide;
  surgery_date?: string;
  prescribed_by?: string;
  reminder_time?: string;
  notifications_enabled?: boolean;
  nickname?: string;
}

interface OnboardingDraft {
  user?: PersonalOnboardingDraft;
  treatment?: TreatmentOnboardingDraft;
}

interface CompleteSessionInput {
  pain_level: number;
  difficulty_rating: 1 | 2 | 3;
  notes?: string;
  duration_minutes: number;
  exercises_completed: string[];
}

interface CompleteSessionResult {
  newBadges: BadgeId[];
  phaseCompleted?: number;
  protocolCompleted: boolean;
}

interface PatientState {
  isOnboarded: boolean;
  user: User;
  treatments: Treatment[];
  activeTreatmentId: string | null;
  onboardingDraft: OnboardingDraft;

  // personal-level
  setPersonalDraft: (d: PersonalOnboardingDraft) => void;
  completePersonalOnboarding: () => void;

  // treatment-level
  setTreatmentDraft: (d: TreatmentOnboardingDraft) => void;
  startTreatment: () => string;
  setActiveTreatment: (id: string) => void;

  // demo / reset
  resetToDemo: () => void;
  resetToInitial: () => void;
  logout: () => void;

  // session
  completeSession: (input: CompleteSessionInput) => CompleteSessionResult;
}

const INJURY_TO_PROTOCOL: Record<InjuryType, string> = {
  lca: "proto_lca",
  meniscus: "proto_meniscus",
  patellofemoral: "proto_patellofemoral",
};

const INJURY_NICKNAME: Record<InjuryType, string> = {
  lca: "LCA",
  meniscus: "Menisco",
  patellofemoral: "Patelofemoral",
};

const SIDE_LABEL: Record<AffectedSide, string> = {
  left: "esquerdo",
  right: "direito",
  bilateral: "bilateral",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekIndexFor(treatment: Treatment, sessionsPerWeek: number): number {
  const sessionNumber = treatment.total_sessions_completed + 1;
  return Math.max(1, Math.ceil(sessionNumber / Math.max(1, sessionsPerWeek)));
}

function makeTreatment(userId: string, draft: TreatmentOnboardingDraft): Treatment {
  const injury = (draft.injury_type ?? "lca") as InjuryType;
  const affected = draft.affected_side ?? "right";
  const protocol = getProtocol(INJURY_TO_PROTOCOL[injury]);
  const total = totalSessionsForProtocol(protocol);
  const nickname =
    draft.nickname?.trim() ||
    `Joelho ${SIDE_LABEL[affected]} (${INJURY_NICKNAME[injury]})`;
  return {
    id: `tr_${Date.now()}`,
    user_id: userId,
    nickname,
    protocol_id: protocol.id,
    injury_type: injury,
    affected_side: affected,
    surgery_date: draft.surgery_date || undefined,
    started_at: todayISO(),
    prescribed_by: draft.prescribed_by?.trim() || "Equipe médica",
    reminder_time: draft.reminder_time,
    status: "active",
    current_phase: 1,
    phases_completed: [],
    badges_unlocked: [],
    total_sessions_prescribed: total,
    total_sessions_completed: 0,
    adherence_rate: 0,
    current_streak: 0,
    longest_streak: 0,
    pain_history: [],
    weekly_frequency: emptyWeeklyFrequency(),
    sessions: [],
  };
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      isOnboarded: true,
      user: MOCK_USER,
      treatments: [MOCK_TREATMENT_LCA_ACTIVE, MOCK_TREATMENT_PATELLO_DONE],
      activeTreatmentId: MOCK_TREATMENT_LCA_ACTIVE.id,
      onboardingDraft: {},

      setPersonalDraft: (d) =>
        set((s) => ({
          onboardingDraft: { ...s.onboardingDraft, user: { ...s.onboardingDraft.user, ...d } },
        })),

      setTreatmentDraft: (d) =>
        set((s) => ({
          onboardingDraft: {
            ...s.onboardingDraft,
            treatment: { ...s.onboardingDraft.treatment, ...d },
          },
        })),

      completePersonalOnboarding: () => {
        const draft = get().onboardingDraft.user ?? {};
        const user: User = {
          ...MOCK_USER,
          id: `user_${Date.now()}`,
          name: draft.name ?? MOCK_USER.name,
          birth_date: draft.birth_date ?? MOCK_USER.birth_date,
          weight_kg: draft.weight_kg ?? MOCK_USER.weight_kg,
          height_cm: draft.height_cm ?? MOCK_USER.height_cm,
          recovery_goal: draft.recovery_goal ?? "daily_life",
          created_at: new Date().toISOString(),
        };
        set({
          isOnboarded: true,
          user,
          treatments: [],
          activeTreatmentId: null,
          onboardingDraft: {},
        });
      },

      startTreatment: () => {
        const state = get();
        const draft = state.onboardingDraft.treatment ?? {};
        const treatment = makeTreatment(state.user.id, draft);
        set({
          treatments: [treatment, ...state.treatments],
          activeTreatmentId: treatment.id,
          onboardingDraft: { ...state.onboardingDraft, treatment: undefined },
        });
        return treatment.id;
      },

      setActiveTreatment: (id) => {
        const t = get().treatments.find((x) => x.id === id);
        if (t) set({ activeTreatmentId: id });
      },

      resetToDemo: () =>
        set({
          isOnboarded: true,
          user: MOCK_USER,
          treatments: [MOCK_TREATMENT_LCA_ACTIVE, MOCK_TREATMENT_PATELLO_DONE],
          activeTreatmentId: MOCK_TREATMENT_LCA_ACTIVE.id,
          onboardingDraft: {},
        }),

      resetToInitial: () =>
        set({
          isOnboarded: true,
          user: MOCK_USER,
          treatments: [],
          activeTreatmentId: null,
          onboardingDraft: {},
        }),

      logout: () =>
        set({
          isOnboarded: false,
          onboardingDraft: {},
        }),

      completeSession: (input) => {
        const state = get();
        const tid = state.activeTreatmentId;
        const treatment = state.treatments.find((t) => t.id === tid);
        if (!treatment) {
          return { newBadges: [], protocolCompleted: false };
        }
        const protocol = getProtocol(treatment.protocol_id);
        const totalPhases = protocol.phases.length;

        // Find phase of the just-completed session
        let cumulative = 0;
        let phaseOfThisSession: ProtocolPhase = protocol.phases[0]!;
        let sessionsBeforeThisPhase = 0;
        for (const ph of protocol.phases) {
          const ses = ph.duration_weeks * ph.sessions_per_week;
          if (treatment.total_sessions_completed < cumulative + ses) {
            phaseOfThisSession = ph;
            sessionsBeforeThisPhase = cumulative;
            break;
          }
          cumulative += ses;
        }

        const newCompletedCount = treatment.total_sessions_completed + 1;
        const sessionsInThisPhaseDone = newCompletedCount - sessionsBeforeThisPhase;
        const sessionsInThisPhaseTotal =
          phaseOfThisSession.duration_weeks * phaseOfThisSession.sessions_per_week;
        const phaseJustCompleted =
          sessionsInThisPhaseDone >= sessionsInThisPhaseTotal &&
          !treatment.phases_completed.includes(phaseOfThisSession.phase_number);

        const adherence_rate = treatment.total_sessions_prescribed
          ? Math.round((newCompletedCount / treatment.total_sessions_prescribed) * 100)
          : 0;
        const current_streak = treatment.current_streak + 1;
        const longest_streak = Math.max(treatment.longest_streak, current_streak);

        const weekIdx = weekIndexFor(treatment, phaseOfThisSession.sessions_per_week);
        const painHistory = treatment.pain_history.map((p) => ({ ...p }));
        const existing = painHistory.find((p) => p.week === weekIdx);
        if (existing) {
          const newCount = existing.session_count + 1;
          existing.average_pain =
            (existing.average_pain * existing.session_count + input.pain_level) / newCount;
          existing.session_count = newCount;
        } else {
          painHistory.push({ week: weekIdx, average_pain: input.pain_level, session_count: 1 });
        }

        const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const todayLabel = weekdays[new Date().getDay()]!;
        const weekly_frequency = treatment.weekly_frequency.map((w) =>
          w.week_label === todayLabel
            ? {
                ...w,
                sessions_done: w.sessions_done + 1,
                sessions_planned: Math.max(w.sessions_planned, w.sessions_done + 1),
              }
            : w,
        );

        const phases_completed = phaseJustCompleted
          ? [...treatment.phases_completed, phaseOfThisSession.phase_number]
          : treatment.phases_completed;

        const nextPhase = phaseJustCompleted
          ? Math.min(totalPhases, phaseOfThisSession.phase_number + 1)
          : phaseOfThisSession.phase_number;

        const tentative: Treatment = {
          ...treatment,
          total_sessions_completed: newCompletedCount,
          adherence_rate,
          current_streak,
          longest_streak,
          current_phase: nextPhase,
          phases_completed,
          pain_history: painHistory,
          weekly_frequency,
        };

        const newBadges = checkNewBadges(tentative, totalPhases);

        const session: Session = {
          id: `sess_${Date.now()}`,
          treatment_id: treatment.id,
          phase_number: phaseOfThisSession.phase_number,
          session_number: sessionsInThisPhaseDone,
          scheduled_date: todayISO(),
          completed_at: new Date().toISOString(),
          exercises_completed: input.exercises_completed,
          pain_level: input.pain_level,
          difficulty_rating: input.difficulty_rating,
          notes: input.notes,
          duration_minutes: input.duration_minutes,
        };

        const protocolCompleted =
          newCompletedCount >= treatment.total_sessions_prescribed &&
          treatment.total_sessions_prescribed > 0;

        const finalTreatment: Treatment = {
          ...tentative,
          badges_unlocked: [...treatment.badges_unlocked, ...newBadges],
          sessions: [session, ...treatment.sessions],
          status: protocolCompleted ? "completed" : treatment.status,
          completed_at: protocolCompleted
            ? new Date().toISOString().slice(0, 10)
            : treatment.completed_at,
        };

        set({
          treatments: state.treatments.map((t) => (t.id === treatment.id ? finalTreatment : t)),
        });

        return {
          newBadges,
          phaseCompleted: phaseJustCompleted ? phaseOfThisSession.phase_number : undefined,
          protocolCompleted,
        };
      },
    }),
    {
      name: "fisiocare-patient-v2",
      version: 3,
      migrate: (persisted: unknown, version) => {
        if (!persisted || typeof persisted !== "object") return persisted as PatientState;
        const state = persisted as Partial<PatientState>;
        if (version < 3) {
          // v3: inject avatar_url for the demo mock user if missing.
          if (state.user && state.user.id === MOCK_USER.id && !state.user.avatar_url) {
            state.user = { ...state.user, avatar_url: MOCK_USER.avatar_url };
          }
        }
        return state as PatientState;
      },
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      skipHydration: true,
    },
  ),
);

// Selectors / derived helpers ------------------------------------------------

export function getActiveTreatment(state: PatientState): Treatment | null {
  if (!state.activeTreatmentId) return null;
  return state.treatments.find((t) => t.id === state.activeTreatmentId) ?? null;
}

export function useActiveTreatment(): Treatment | null {
  return usePatientStore((s) =>
    s.activeTreatmentId ? s.treatments.find((t) => t.id === s.activeTreatmentId) ?? null : null,
  );
}

export function currentPhaseOf(treatment: Treatment) {
  const protocol = getProtocol(treatment.protocol_id);
  return (
    protocol.phases.find((p) => p.phase_number === treatment.current_phase) ??
    protocol.phases[0]!
  );
}

export function todaySessionInfoOf(treatment: Treatment) {
  const protocol = getProtocol(treatment.protocol_id);
  let cumulative = 0;
  for (const ph of protocol.phases) {
    const ses = ph.duration_weeks * ph.sessions_per_week;
    if (treatment.total_sessions_completed < cumulative + ses) {
      return {
        phase: ph,
        sessionNumber: treatment.total_sessions_completed - cumulative + 1,
        sessionsInPhase: ses,
        sessionsBeforePhase: cumulative,
        protocol,
      };
    }
    cumulative += ses;
  }
  const last = protocol.phases[protocol.phases.length - 1]!;
  return {
    phase: last,
    sessionNumber: last.duration_weeks * last.sessions_per_week,
    sessionsInPhase: last.duration_weeks * last.sessions_per_week,
    sessionsBeforePhase: cumulative - last.duration_weeks * last.sessions_per_week,
    protocol,
  };
}