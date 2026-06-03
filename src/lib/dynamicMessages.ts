import type { PainEntry, Progress } from "@/lib/types";

export function getDynamicMessage(progress: Progress, painHistory: PainEntry[]): string {
  const latestPain = painHistory[painHistory.length - 1]?.average_pain ?? 10;
  const firstPain = painHistory[0]?.average_pain ?? 10;
  const painReduction = firstPain > 0 ? Math.round(((firstPain - latestPain) / firstPain) * 100) : 0;
  const sessionsLeft = Math.max(0, progress.total_sessions_prescribed - progress.total_sessions_completed);

  if (progress.current_streak >= 21) return `🔥 ${progress.current_streak} dias de sequência. Você está construindo algo real.`;
  if (progress.current_streak >= 7) return `🔥 ${progress.current_streak} dias seguidos. Hábito em formação.`;
  if (painReduction >= 30) return `📉 Sua dor reduziu ${painReduction}% desde o início. Está funcionando.`;
  if (progress.adherence_rate >= 80) return `Você está a ${sessionsLeft} sessões de voltar à sua rotina.`;
  return `Cada sessão conta. Continue.`;
}

export function getEvolutionMessage(progress: Progress): string {
  const pct = Math.round(progress.adherence_rate);
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