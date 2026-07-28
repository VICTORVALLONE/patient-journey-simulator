import type { Treatment } from "@/lib/types";
import { getProtocol } from "@/data/protocols";
import { totalSessionsForProtocol } from "@/lib/prescription";

/** Redução percentual da dor entre primeira e última semana registrada.
 * Retorna null quando não há dados suficientes. */
export function painReductionPct(treatment: Treatment): number | null {
  const h = treatment.pain_history;
  if (h.length < 2) return null;
  const first = h[0]?.average_pain ?? 0;
  const last = h[h.length - 1]?.average_pain ?? 0;
  if (first <= 0) return null;
  return Math.max(0, Math.round(((first - last) / first) * 100));
}

/** Adesão real = sessões feitas / sessões esperadas até hoje, baseado em
 * started_at e sessions_per_week do protocolo. Cap em 100. */
export function realAdherencePct(treatment: Treatment): number {
  const start = new Date(treatment.started_at);
  if (Number.isNaN(start.getTime())) return treatment.adherence_rate;
  const today = new Date();
  const days = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
  const protocol = getProtocol(treatment.protocol_id);
  const spw = protocol.sessions_per_week || 3;
  const totalPrescribed = totalSessionsForProtocol(protocol);
  const expected = Math.min(totalPrescribed, Math.ceil((days / 7) * spw));
  if (expected <= 0) return 0;
  return Math.min(100, Math.round((treatment.total_sessions_completed / expected) * 100));
}

/** Semanas concluídas (aprox) com base em sessões feitas e spw. */
export function weeksProgress(treatment: Treatment): { done: number; total: number } {
  const protocol = getProtocol(treatment.protocol_id);
  const spw = protocol.sessions_per_week || 3;
  const done = Math.min(protocol.total_weeks, Math.round(treatment.total_sessions_completed / spw));
  return { done, total: protocol.total_weeks };
}

export function getDynamicMessage(treatment: Treatment): string {
  const reduction = painReductionPct(treatment);
  const sessionsLeft = Math.max(
    0,
    treatment.total_sessions_prescribed - treatment.total_sessions_completed,
  );
  if (reduction !== null && reduction >= 20) {
    return `📉 Sua dor reduziu ${reduction}% desde o início. Está funcionando.`;
  }
  if (treatment.current_streak >= 3) {
    return `🔥 ${treatment.current_streak} semanas seguidas batendo sua meta. Hábito em formação.`;
  }
  if (sessionsLeft > 0 && treatment.total_sessions_completed > 0) {
    return `Faltam ${sessionsLeft} sessões para concluir o protocolo.`;
  }
  return `Cada sessão conta. Continue.`;
}

export function getEvolutionMessage(treatment: Treatment): string {
  const reduction = painReductionPct(treatment);
  const protocol = getProtocol(treatment.protocol_id);
  const phaseInfo = `Fase ${treatment.current_phase} de ${protocol.phases.length}`;
  if (reduction !== null) return `Dor reduziu ${reduction}% · ${phaseInfo}`;
  return phaseInfo;
}

export function greeting(name: string): string {
  const h = new Date().getHours();
  const first = name.split(" ")[0] ?? name;
  if (h < 12) return `Bom dia, ${first}`;
  if (h < 18) return `Boa tarde, ${first}`;
  return `Boa noite, ${first}`;
}
