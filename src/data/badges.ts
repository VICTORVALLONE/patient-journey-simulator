import type { Badge, BadgeId } from "@/lib/types";

export const BADGES: Record<BadgeId, Omit<Badge, "unlocked" | "unlocked_at">> = {
  first_session: {
    id: "first_session",
    name: "Primeiro Passo",
    description: "Concluiu a primeira sessão",
    icon: "🦶",
  },
  week_1: {
    id: "week_1",
    name: "Primeira Semana",
    description: "Completou a primeira semana",
    icon: "📅",
  },
  sessions_10: {
    id: "sessions_10",
    name: "10 Sessões",
    description: "Concluiu 10 sessões",
    icon: "💪",
  },
  // Marcos de DIAS (decisão de 2026-07-28): a camada base de engajamento.
  // Dia conta uma vez, mesmo com itens 3× ao dia — dias, não doses.
  streak_days_10: {
    id: "streak_days_10",
    name: "10 Dias Seguidos",
    description: "10 dias consecutivos de sessão concluída",
    icon: "🔥",
  },
  days_complete_20: {
    id: "days_complete_20",
    name: "20 Dias Completos",
    description: "20 dias de sessão concluída no total",
    icon: "🏅",
  },
  streak_7: {
    id: "streak_7",
    name: "3 Semanas no Ritmo",
    description: "3 semanas seguidas batendo a meta",
    icon: "🔥",
  },
  streak_21: {
    id: "streak_21",
    name: "2 Meses no Ritmo",
    description: "8 semanas seguidas batendo a meta",
    icon: "⚡",
  },
  phase_1_complete: {
    id: "phase_1_complete",
    name: "Fase 1 Concluída",
    description: "Controle de edema completo",
    icon: "🧊",
  },
  phase_2_complete: {
    id: "phase_2_complete",
    name: "Fase 2 Concluída",
    description: "Mobilidade restaurada",
    icon: "🔄",
  },
  phase_3_complete: {
    id: "phase_3_complete",
    name: "Fase 3 Concluída",
    description: "Fortalecimento completo",
    icon: "🏋️",
  },
  phase_4_complete: {
    id: "phase_4_complete",
    name: "Fase 4 Concluída",
    description: "Retorno funcional atingido",
    icon: "🏃",
  },
  halfway: {
    id: "halfway",
    name: "Metade do Caminho",
    description: "50% do protocolo concluído",
    icon: "⭐",
  },
  protocol_complete: {
    id: "protocol_complete",
    name: "Recuperação Completa",
    description: "Protocolo 100% concluído",
    icon: "🏆",
  },
};

export const ALL_BADGE_IDS: BadgeId[] = Object.keys(BADGES) as BadgeId[];
