import type { Treatment } from "@/lib/types";

export function getDynamicMessage(treatment: Treatment): string {
  const painHistory = treatment.pain_history;
  const latestPain = painHistory[painHistory.length - 1]?.average_pain ?? 10;
  const firstPain = painHistory[0]?.average_pain ?? 10;
  const painReduction = firstPain > 0 ? Math.round(((firstPain - latestPain) / firstPain) * 100) : 0;
  const sessionsLeft = Math.max(
    0,
    treatment.total_sessions_prescribed - treatment.total_sessions_completed,
  );

  if (treatment.current_streak >= 21) return `🔥 ${treatment.current_streak} dias de sequência. Você está construindo algo real.`;
  if (treatment.current_streak >= 7) return `🔥 ${treatment.current_streak} dias seguidos. Hábito em formação.`;
  if (painReduction >= 30) return `📉 Sua dor reduziu ${painReduction}% desde o início. Está funcionando.`;
  if (treatment.adherence_rate >= 80) return `Você está a ${sessionsLeft} sessões de voltar à sua rotina.`;
  return `Cada sessão conta. Continue.`;
}

export function getEvolutionMessage(treatment: Treatment): string {
  const pct = Math.round(treatment.adherence_rate);
  const remaining = Math.max(0, 100 - pct);
  return `Você está ${remaining}% mais perto da recuperação total.`;
}

export function greeting(name: string): string {
  const h = new Date().getHours();
  const first = name.split(" ")[0] ?? name;
  if (h < 12) return `Bom dia, ${first}`;
  if (h < 18) return `Boa tarde, ${first}`;
  return `Boa noite, ${first}`;
}