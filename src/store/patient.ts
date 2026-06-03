import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { MOCK_USER, MOCK_PRESCRIPTION, MOCK_PROGRESS, INITIAL_PROGRESS } from "@/data/mockUser";
import { getProtocol, totalSessionsForProtocol } from "@/data/protocols";
import { checkNewBadges } from "@/lib/badges";
import type {
  BadgeId,
  InjuryType,
  Prescription,
  Progress,
  ProtocolPhase,
  Session,
  User,
} from "@/lib/types";

export type OnboardingDraft = Partial<{
  name: string;
  birth_date: string;
  weight_kg: number;
  height_cm: number;
  surgery_date: string;
  recovery_goal: User["recovery_goal"];
  injury_type: InjuryType;
  affected_side: Prescription["affected_side"];
  prescribed_by: string;
  reminder_time: string;
  notifications_enabled: boolean;
}>;

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
  prescription: Prescription;
  progress: Progress;
  sessions: Session[];
  onboardingDraft: OnboardingDraft;

  // actions
  setOnboardingDraft: (d: OnboardingDraft) => void;
  completeOnboarding: () => void;
  resetToDemo: () => void;
  resetToInitial: () => void;
  completeSession: (input: CompleteSessionInput) => CompleteSessionResult;
  logout: () => void;
}

const INJURY_TO_PROTOCOL: Record<InjuryType, string> = {
  lca: "proto_lca",
  meniscus: "proto_meniscus",
  patellofemoral: "proto_patellofemoral",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekIndexFor(progress: Progress, sessionsPerWeek: number): number {
  const sessionNumber = progress.total_sessions_completed + 1;
  return Math.max(1, Math.ceil(sessionNumber / Math.max(1, sessionsPerWeek)));
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      isOnboarded: true,
      user: MOCK_USER,
      prescription: MOCK_PRESCRIPTION,
      progress: MOCK_PROGRESS,
      sessions: [],
      onboardingDraft: {},

      setOnboardingDraft: (d) =>
        set((s) => ({ onboardingDraft: { ...s.onboardingDraft, ...d } })),

      completeOnboarding: () => {
        const d = get().onboardingDraft;
        const injury = (d.injury_type ?? "lca") as InjuryType;
        const protocol = getProtocol(INJURY_TO_PROTOCOL[injury]);
        const total = totalSessionsForProtocol(protocol);

        const user: User = {
          ...MOCK_USER,
          id: `user_${Date.now()}`,
          name: d.name ?? MOCK_USER.name,
          birth_date: d.birth_date ?? MOCK_USER.birth_date,
          weight_kg: d.weight_kg ?? MOCK_USER.weight_kg,
          height_cm: d.height_cm ?? MOCK_USER.height_cm,
          recovery_goal: d.recovery_goal ?? "daily_life",
          created_at: new Date().toISOString(),
        };

        const prescription: Prescription = {
          ...MOCK_PRESCRIPTION,
          id: `presc_${Date.now()}`,
          user_id: user.id,
          protocol_id: protocol.id,
          injury_type: injury,
          affected_side: d.affected_side ?? "right",
          surgery_date: d.surgery_date,
          start_date: todayISO(),
          prescribed_by: d.prescribed_by ?? "Dr. Carlos Mendes",
          status: "active",
        };

        const progress: Progress = {
          ...INITIAL_PROGRESS,
          user_id: user.id,
          total_sessions_prescribed: total,
        };

        set({
          isOnboarded: true,
          user,
          prescription,
          progress,
          sessions: [],
          onboardingDraft: {},
        });
      },

      resetToDemo: () =>
        set({
          isOnboarded: true,
          user: MOCK_USER,
          prescription: MOCK_PRESCRIPTION,
          progress: { ...MOCK_PROGRESS },
          sessions: [],
          onboardingDraft: {},
        }),

      resetToInitial: () => {
        const protocol = getProtocol(MOCK_PRESCRIPTION.protocol_id);
        set({
          isOnboarded: true,
          user: MOCK_USER,
          prescription: MOCK_PRESCRIPTION,
          progress: {
            ...INITIAL_PROGRESS,
            user_id: MOCK_USER.id,
            total_sessions_prescribed: totalSessionsForProtocol(protocol),
          },
          sessions: [],
          onboardingDraft: {},
        });
      },

      logout: () =>
        set({
          isOnboarded: false,
          onboardingDraft: {},
        }),

      completeSession: (input) => {
        const state = get();
        const protocol = getProtocol(state.prescription.protocol_id);
        const prev = state.progress;
        const totalPhases = protocol.phases.length;

        // figure out which phase the just-completed session belonged to
        let cumulative = 0;
        let phaseOfThisSession: ProtocolPhase = protocol.phases[0]!;
        let sessionsBeforeThisPhase = 0;
        for (const ph of protocol.phases) {
          const ses = ph.duration_weeks * ph.sessions_per_week;
          if (prev.total_sessions_completed < cumulative + ses) {
            phaseOfThisSession = ph;
            sessionsBeforeThisPhase = cumulative;
            break;
          }
          cumulative += ses;
        }

        const newCompletedCount = prev.total_sessions_completed + 1;
        const sessionsInThisPhaseDone = newCompletedCount - sessionsBeforeThisPhase;
        const sessionsInThisPhaseTotal =
          phaseOfThisSession.duration_weeks * phaseOfThisSession.sessions_per_week;
        const phaseJustCompleted =
          sessionsInThisPhaseDone >= sessionsInThisPhaseTotal &&
          !prev.phases_completed.includes(phaseOfThisSession.phase_number);

        const adherence_rate = prev.total_sessions_prescribed
          ? Math.round((newCompletedCount / prev.total_sessions_prescribed) * 100)
          : 0;
        const current_streak = prev.current_streak + 1;
        const longest_streak = Math.max(prev.longest_streak, current_streak);

        // update pain_history (one entry per week)
        const weekIdx = weekIndexFor(prev, phaseOfThisSession.sessions_per_week);
        const painHistory = [...prev.pain_history];
        const existing = painHistory.find((p) => p.week === weekIdx);
        if (existing) {
          const newCount = existing.session_count + 1;
          existing.average_pain =
            (existing.average_pain * existing.session_count + input.pain_level) / newCount;
          existing.session_count = newCount;
        } else {
          painHistory.push({ week: weekIdx, average_pain: input.pain_level, session_count: 1 });
        }

        // weekly frequency: increment today's weekday
        const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const todayLabel = weekdays[new Date().getDay()]!;
        const weekly_frequency = prev.weekly_frequency.map((w) =>
          w.week_label === todayLabel
            ? { ...w, sessions_done: w.sessions_done + 1, sessions_planned: Math.max(w.sessions_planned, w.sessions_done + 1) }
            : w,
        );

        const phases_completed = phaseJustCompleted
          ? [...prev.phases_completed, phaseOfThisSession.phase_number]
          : prev.phases_completed;

        const nextPhase = phaseJustCompleted
          ? Math.min(totalPhases, phaseOfThisSession.phase_number + 1)
          : phaseOfThisSession.phase_number;

        const tentativeProgress: Progress = {
          ...prev,
          total_sessions_completed: newCompletedCount,
          adherence_rate,
          current_streak,
          longest_streak,
          current_phase: nextPhase,
          phases_completed,
          pain_history: painHistory,
          weekly_frequency,
        };

        const newBadges = checkNewBadges(tentativeProgress, totalPhases);
        const progress: Progress = {
          ...tentativeProgress,
          badges_unlocked: [...prev.badges_unlocked, ...newBadges],
        };

        const session: Session = {
          id: `sess_${Date.now()}`,
          prescription_id: state.prescription.id,
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
          newCompletedCount >= prev.total_sessions_prescribed && prev.total_sessions_prescribed > 0;

        set({
          progress: protocolCompleted ? { ...progress, /* keep */ } : progress,
          sessions: [session, ...state.sessions],
          prescription: protocolCompleted
            ? { ...state.prescription, status: "completed" }
            : state.prescription,
        });

        return {
          newBadges,
          phaseCompleted: phaseJustCompleted ? phaseOfThisSession.phase_number : undefined,
          protocolCompleted,
        };
      },
    }),
    {
      name: "fisiocare-patient-v1",
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
      // Skip hydration on server
      skipHydration: true,
    },
  ),
);

// Selectors / derived helpers ------------------------------------------------

export function currentPhase(progress: Progress, protocolId: string) {
  const protocol = getProtocol(protocolId);
  return (
    protocol.phases.find((p) => p.phase_number === progress.current_phase) ??
    protocol.phases[0]!
  );
}

export function todaySessionInfo(progress: Progress, protocolId: string) {
  const protocol = getProtocol(protocolId);
  let cumulative = 0;
  for (const ph of protocol.phases) {
    const ses = ph.duration_weeks * ph.sessions_per_week;
    if (progress.total_sessions_completed < cumulative + ses) {
      return {
        phase: ph,
        sessionNumber: progress.total_sessions_completed - cumulative + 1,
        sessionsInPhase: ses,
        sessionsBeforePhase: cumulative,
        protocol,
      };
    }
    cumulative += ses;
  }
  // protocol completed
  const last = protocol.phases[protocol.phases.length - 1]!;
  return {
    phase: last,
    sessionNumber: last.duration_weeks * last.sessions_per_week,
    sessionsInPhase: last.duration_weeks * last.sessions_per_week,
    sessionsBeforePhase: cumulative - last.duration_weeks * last.sessions_per_week,
    protocol,
  };
}