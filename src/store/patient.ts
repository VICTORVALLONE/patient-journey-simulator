import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  MOCK_USER,
  MOCK_TREATMENT_LCA_ACTIVE,
  MOCK_TREATMENT_LCA_WEEK1,
  MOCK_TREATMENT_PATELLO_DONE,
  emptyWeeklyFrequency,
} from "@/data/mockUser";
import { getProtocol } from "@/data/protocols";
import {
  firstWeekOfPhase,
  phaseForWeek,
  phaseForWeekWithItems,
  postOpWeekOf,
  sessionsInPhase,
  sessionsThroughWeek,
  totalSessionsForProtocol,
} from "@/lib/prescription";
import { checkNewBadges } from "@/lib/badges";
import { isDemoUnlocked } from "@/lib/demoMode";
import { EMPTY_USER } from "@/lib/user";
import { computeDayStreak, computeWeeklyStreak } from "@/lib/streak";
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
  /** Itens marcados "Tive dificuldade" durante a execução. */
  exercises_with_difficulty?: string[];
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
  completeWelcome: (treatmentId?: string) => void;

  // demo / reset
  resetToDemo: () => void;
  resetToInitial: () => void;
  startFreshSignup: () => void;

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

function makeTreatment(userId: string, draft: TreatmentOnboardingDraft): Treatment {
  const injury = (draft.injury_type ?? "lca") as InjuryType;
  const affected = draft.affected_side ?? "right";
  const protocol = getProtocol(INJURY_TO_PROTOCOL[injury]);
  const total = totalSessionsForProtocol(protocol);
  const nickname =
    draft.nickname?.trim() || `Joelho ${SIDE_LABEL[affected]} (${INJURY_NICKNAME[injury]})`;
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
    current_day_streak: 0,
    longest_day_streak: 0,
    pain_history: [],
    weekly_frequency: emptyWeeklyFrequency(),
    sessions: [],
  };
}

/**
 * O estado de um app que ninguém usou ainda.
 *
 * É a semente da store **e** o destino de `startFreshSignup`, de propósito: as
 * duas coisas são a mesma pergunta ("o que um paciente vê ao chegar?") e
 * mantê-las em dois lugares foi o que deixou `startFreshSignup` esquecer de
 * zerar o `user`.
 *
 * Nasce **sem mockup nenhum**. Antes vinha semeada com o paciente-demo, sob a
 * justificativa de que ficaria inerte enquanto `isOnboarded` fosse `false` — e
 * não ficava: `completePersonalOnboarding` não limpa tratamentos, então o
 * paciente novo herdava os três do demo, e o spread de `MOCK_USER` ainda lhe
 * dava o telefone, o e-mail e a foto de outra pessoa. O demo volta por
 * `resetToDemo()`, que é chamado só pela rota `/demo` e pelas ferramentas do
 * operador.
 */
function freshPatientData() {
  return {
    isOnboarded: false,
    user: EMPTY_USER,
    treatments: [] as Treatment[],
    activeTreatmentId: null,
    onboardingDraft: {} as OnboardingDraft,
  };
}

/**
 * Migração v3 → v4. Um único passo não-identidade: **recalcular
 * `total_sessions_prescribed`**.
 *
 * A semana 1 do LCA virou diária, o que leva o total de 86 para 90. Sem
 * recalcular, todo tratamento já salvo continuaria dividindo a adesão por um
 * denominador que não existe mais — e a adesão passaria a subir sozinha.
 *
 * **Tratamento concluído fica intacto.** Recalcular o total dele empurraria
 * `total_sessions_completed` para baixo do novo total e desligaria o badge
 * `protocol_complete` de quem já terminou: uma conquista sumindo da tela por
 * causa de uma mudança de conteúdo. O passado fica com o denominador do
 * passado.
 */
export function migrateTreatmentToV4(t: Treatment): Treatment {
  if (t.status === "completed") return t;
  const protocol = getProtocol(t.protocol_id);
  const recalculated = totalSessionsForProtocol(protocol);
  if (recalculated === t.total_sessions_prescribed) return t;
  return {
    ...t,
    total_sessions_prescribed: recalculated,
    adherence_rate: recalculated
      ? Math.round((t.total_sessions_completed / recalculated) * 100)
      : 0,
  };
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      ...freshPatientData(),

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
        // Base é o usuário VAZIO, não o mock. Com `...MOCK_USER`, os campos que
        // o cadastro não pede — telefone, e-mail e avatar — sobreviviam ao
        // spread, e o paciente terminava com a identidade do demo. O e-mail do
        // demo chegava a ser impresso no PDF "compartilhar com médico".
        const user: User = {
          ...EMPTY_USER,
          id: `user_${Date.now()}`,
          name: draft.name?.trim() ?? "",
          birth_date: draft.birth_date ?? "",
          weight_kg: draft.weight_kg ?? 0,
          height_cm: draft.height_cm ?? 0,
          recovery_goal: draft.recovery_goal ?? "daily_life",
          created_at: new Date().toISOString(),
        };
        // NÃO limpa `treatments`: "terminei meu perfil" nunca deveria apagar
        // tratamento. O wipe é explícito, em startFreshSignup().
        set({ isOnboarded: true, user, onboardingDraft: {} });
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

      // Carimba a CONCLUSÃO DA TELA de boas-vindas — não o fato de ter assistido
      // ao vídeo. Ver DECISIONS.md: o produto não bloqueia por vídeo não visto.
      completeWelcome: (treatmentId) => {
        const state = get();
        const tid = treatmentId ?? state.activeTreatmentId;
        if (!tid) return;
        const stamp = new Date().toISOString();
        set({
          treatments: state.treatments.map((t) =>
            t.id === tid ? { ...t, welcome_completed_at: stamp } : t,
          ),
        });
      },

      // Única porta de entrada do paciente-demo desde que a semente ficou vazia.
      // Chamada pela rota `/demo` e pelas ferramentas do operador — nunca no
      // caminho de um paciente.
      resetToDemo: () =>
        set({
          isOnboarded: true,
          user: MOCK_USER,
          treatments: [
            MOCK_TREATMENT_LCA_ACTIVE,
            MOCK_TREATMENT_LCA_WEEK1,
            MOCK_TREATMENT_PATELLO_DONE,
          ],
          activeTreatmentId: MOCK_TREATMENT_LCA_ACTIVE.id,
          onboardingDraft: {},
        }),

      // "Como fica o app sem nenhum tratamento" — o estado que a home atende
      // com o EmptyTreatmentState. **Preserva o usuário atual**: quem testa o
      // estado vazio quer testá-lo como si mesmo, não virar o Alexandre.
      resetToInitial: () =>
        set((s) => ({
          isOnboarded: true,
          user: s.user,
          treatments: [],
          activeTreatmentId: null,
          onboardingDraft: {},
        })),

      // Volta ao começo da jornada real. Zera o `user` junto: antes não zerava,
      // apesar de o comentário chamá-lo de wipe, e o objeto do paciente
      // anterior ficava na store esperando alguém lê-lo.
      startFreshSignup: () => set(freshPatientData()),

      completeSession: (input) => {
        const state = get();
        const tid = state.activeTreatmentId;
        const treatment = state.treatments.find((t) => t.id === tid);
        if (!treatment) {
          return { newBadges: [], protocolCompleted: false };
        }
        // Guarda: 1 sessão por dia — é o que mantém a adesão honesta (dias,
        // não doses). EXCEÇÃO (2026-07-28): com o modo demo destravado a
        // repetição é liberada, para o médico exercitar a medição (dor,
        // contagem, badges) sem esperar o calendário. O paciente não tem a
        // porta. Streak de dias não infla com a repetição: ele deduplica por
        // data por construção. Leitura preguiçosa dentro da ação — nunca em
        // render — então sem risco de hidratação.
        const todayStr = todayISO();
        if (!isDemoUnlocked() && treatment.sessions.some((s) => s.scheduled_date === todayStr)) {
          return { newBadges: [], protocolCompleted: treatment.status === "completed" };
        }
        const protocol = getProtocol(treatment.protocol_id);
        const totalPhases = protocol.phases.length;

        // A fase da sessão vem da MESMA derivação que o seletor usa
        // (`todaySessionInfoOf` → semana pós-op). Enquanto o reducer contava
        // sessões e o seletor contava semanas, os dois discordavam: a tela dizia
        // "Fase 2" e a sessão era gravada com `phase_number: 1`.
        const currentWeek = postOpWeekOf(treatment, protocol);
        const phaseOfThisSession = phaseForWeek(protocol, currentWeek);
        const sessionsBeforeThisPhase = sessionsThroughWeek(
          protocol,
          firstWeekOfPhase(protocol, phaseOfThisSession) - 1,
        );

        const newCompletedCount = treatment.total_sessions_completed + 1;
        const sessionsInThisPhaseDone = Math.max(1, newCompletedCount - sessionsBeforeThisPhase);
        const sessionsInThisPhaseTotal = sessionsInPhase(protocol, phaseOfThisSession);
        const phaseJustCompleted =
          sessionsInThisPhaseDone >= sessionsInThisPhaseTotal &&
          !treatment.phases_completed.includes(phaseOfThisSession.phase_number);

        const adherence_rate = treatment.total_sessions_prescribed
          ? Math.round((newCompletedCount / treatment.total_sessions_prescribed) * 100)
          : 0;

        const session: Session = {
          id: `sess_${Date.now()}`,
          treatment_id: treatment.id,
          phase_number: phaseOfThisSession.phase_number,
          session_number: sessionsInThisPhaseDone,
          scheduled_date: todayISO(),
          completed_at: new Date().toISOString(),
          exercises_completed: input.exercises_completed,
          exercises_with_difficulty: input.exercises_with_difficulty?.length
            ? input.exercises_with_difficulty
            : undefined,
          pain_level: input.pain_level,
          difficulty_rating: input.difficulty_rating,
          notes: input.notes,
          duration_minutes: input.duration_minutes,
        };
        const allSessions = [session, ...treatment.sessions];

        // Streaks honestos, recalculados do histórico real (não +1 por sessão):
        // dias seguidos como camada base; semanas batendo a meta, só a partir
        // da semana pós-op 3 e ancoradas na MESMA âncora da progressão.
        const dayStreak = computeDayStreak(allSessions);
        const weekStreak = computeWeeklyStreak(
          allSessions,
          protocol,
          treatment.surgery_date || treatment.started_at,
        );
        const current_streak = weekStreak.current;
        const longest_streak = Math.max(treatment.longest_streak, weekStreak.longest);
        const current_day_streak = dayStreak.current;
        const longest_day_streak = Math.max(treatment.longest_day_streak ?? 0, dayStreak.longest);

        // O eixo do histórico de dor é a semana pós-op — o mesmo eixo do gráfico
        // de ADM e dos marcos. Antes era mais uma contagem por sessões.
        const weekIdx = currentWeek;
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
                sessions_done: 1,
                sessions_planned: Math.max(w.sessions_planned, 1),
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
          current_day_streak,
          longest_day_streak,
          current_phase: nextPhase,
          phases_completed,
          pain_history: painHistory,
          weekly_frequency,
        };

        const newBadges = checkNewBadges(tentative, totalPhases);

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
      version: 4,
      migrate: (persisted: unknown, version) => {
        if (!persisted || typeof persisted !== "object") return persisted as PatientState;
        const state = persisted as Partial<PatientState>;
        if (version < 3) {
          // v3: inject avatar_url for the demo mock user if missing.
          if (state.user && state.user.id === MOCK_USER.id && !state.user.avatar_url) {
            state.user = { ...state.user, avatar_url: MOCK_USER.avatar_url };
          }
        }
        if (version < 4) {
          state.treatments = (state.treatments ?? []).map(migrateTreatmentToV4);
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

// Reidratação síncrona no cliente ---------------------------------------------
//
// `skipHydration: true` existe para o SSR não tocar em localStorage, mas deixa a
// reidratação dentro do useEffect de useHydratedStore — que só roda DEPOIS de um
// componente montar. `beforeLoad` roda antes disso, então um guard de rota leria
// o seed inerte e deixaria passar um refresh direto em /session/today.
//
// localStorage é síncrono: chamar rehydrate() aqui deixa o estado real pronto
// assim que este módulo é avaliado no cliente, sem SSR ler storage. São dois
// canais deliberados: este, síncrono, para o router; e useHydratedStore, baseado
// em efeito, para gatear render (evita mismatch de markup SSR/cliente).
if (typeof window !== "undefined") {
  void usePatientStore.persist.rehydrate();
}

// Selectors / derived helpers ------------------------------------------------

export function getActiveTreatment(state: PatientState): Treatment | null {
  if (!state.activeTreatmentId) return null;
  return state.treatments.find((t) => t.id === state.activeTreatmentId) ?? null;
}

export function useActiveTreatment(): Treatment | null {
  return usePatientStore((s) =>
    s.activeTreatmentId ? (s.treatments.find((t) => t.id === s.activeTreatmentId) ?? null) : null,
  );
}

export function currentPhaseOf(treatment: Treatment) {
  const protocol = getProtocol(treatment.protocol_id);
  return (
    protocol.phases.find((p) => p.phase_number === treatment.current_phase) ?? protocol.phases[0]!
  );
}

/**
 * O que o paciente faz **hoje**.
 *
 * Antes, a fase saía da contagem de sessões concluídas; agora sai da semana
 * pós-operatória. A diferença aparece em quem falta: pela contagem, faltar uma
 * semana fazia o paciente permanecer na semana 1 indefinidamente — o protocolo
 * clínico não espera ninguém. `exercises` já vem recortado para a semana, então
 * a semana 1 mostra os cuidados da semana 1 e não os exercícios da semana 2.
 */
export function todaySessionInfoOf(treatment: Treatment) {
  const protocol = getProtocol(treatment.protocol_id);
  const week = postOpWeekOf(treatment, protocol);
  const phase = phaseForWeekWithItems(protocol, week);
  const firstWeek = firstWeekOfPhase(protocol, phase);
  const sessionsBeforePhase = sessionsThroughWeek(protocol, firstWeek - 1);
  const inPhase = sessionsInPhase(protocol, phase);
  const done = Math.max(0, treatment.total_sessions_completed - sessionsBeforePhase);
  return {
    week,
    phase,
    sessionNumber: Math.min(done + 1, inPhase),
    sessionsInPhase: inPhase,
    sessionsBeforePhase,
    protocol,
  };
}
