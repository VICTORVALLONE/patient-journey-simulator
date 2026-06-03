import type { Badge, BadgeId } from "@/lib/types";

export const BADGES: Record<BadgeId, Omit<Badge, "unlocked" | "unlocked_at">> = {
  first_session: { id: "first_session", name: "Primeiro Passo", description: "Concluiu a primeira sessão", icon: "🦶" },
  week_1: { id: "week_1", name: "Primeira Semana", description: "Completou a primeira semana", icon: "📅" },
  sessions_10: { id: "sessions_10", name: "10 Sessões", description: "Concluiu 10 sessões", icon: "💪" },
  streak_7: { id: "streak_7", name: "7 Dias Seguidos", description: "Sequência de 7 dias", icon: "🔥" },
  streak_21: { id: "streak_21", name: "21 Dias Seguidos", description: "Hábito formado", icon: "⚡" },
  phase_1_complete: { id: "phase_1_complete", name: "Fase 1 Concluída", description: "Controle de edema completo", icon: "🧊" },
  phase_2_complete: { id: "phase_2_complete", name: "Fase 2 Concluída", description: "Mobilidade restaurada", icon: "🔄" },
  phase_3_complete: { id: "phase_3_complete", name: "Fase 3 Concluída", description: "Fortalecimento completo", icon: "🏋️" },
  phase_4_complete: { id: "phase_4_complete", name: "Fase 4 Concluída", description: "Retorno funcional atingido", icon: "🏃" },
  halfway: { id: "halfway", name: "Metade do Caminho", description: "50% do protocolo concluído", icon: "⭐" },
  protocol_complete: { id: "protocol_complete", name: "Recuperação Completa", description: "Protocolo 100% concluído", icon: "🏆" },
};

export const ALL_BADGE_IDS: BadgeId[] = Object.keys(BADGES) as BadgeId[];