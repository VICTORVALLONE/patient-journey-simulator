import { postOpWeekFromDays, todayISO } from "@/lib/entry";
import type {
  Exercise,
  Protocol,
  ProtocolPhase,
  SessionPhase,
  Treatment,
  WeekGuideEntry,
} from "@/lib/types";

/**
 * O que o paciente deve fazer **nesta semana pós-operatória**.
 *
 * Existe para desfazer um acoplamento que estava errado na raiz: o app derivava
 * a semana da *contagem de sessões concluídas*, em três lugares e de três
 * jeitos. Quem falta uma semana não volta no tempo — a semana é uma função da
 * data da cirurgia, e só dela. Tudo aqui parte de `postOpWeekOf`.
 */

/** Diferença em dias entre duas datas ISO, imune a fuso e horário de verão. */
function daysBetween(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split("-").map(Number);
  const [ty, tm, td] = toISO.split("-").map(Number);
  return Math.round((Date.UTC(ty!, tm! - 1, td!) - Date.UTC(fy!, fm! - 1, fd!)) / 86_400_000);
}

/**
 * Semana pós-op do tratamento, 1-indexada e limitada ao fim do protocolo.
 *
 * Fallback em `started_at` para tratamento conservador (patelofemoral não tem
 * cirurgia) e para dados legados anteriores à obrigatoriedade da data.
 */
export function postOpWeekOf(
  treatment: Treatment,
  protocol: Protocol,
  today: string = todayISO(),
): number {
  const anchor = treatment.surgery_date || treatment.started_at;
  if (!anchor) return 1;
  const days = daysBetween(anchor, today);
  if (Number.isNaN(days)) return 1;
  return Math.min(postOpWeekFromDays(days), protocol.total_weeks);
}

/** Fase que cobre a semana pedida. Fases são contíguas por `duration_weeks`. */
export function phaseForWeek(protocol: Protocol, week: number): ProtocolPhase {
  let start = 1;
  for (const phase of protocol.phases) {
    const end = start + phase.duration_weeks - 1;
    if (week <= end) return phase;
    start = end + 1;
  }
  return protocol.phases[protocol.phases.length - 1]!;
}

/** Primeira semana pós-op coberta por uma fase (1-indexada). */
export function firstWeekOfPhase(protocol: Protocol, phase: ProtocolPhase): number {
  let start = 1;
  for (const p of protocol.phases) {
    if (p.id === phase.id) return start;
    start += p.duration_weeks;
  }
  return 1;
}

export function weekGuideFor(protocol: Protocol, week: number): WeekGuideEntry | undefined {
  return protocol.clinical_guide?.weeks.find((w) => week >= w.week_start && week <= w.week_end);
}

/**
 * Cadência da semana: o guia clínico manda, a fase é o padrão. A semana 1 do
 * LCA é diária (7) enquanto a fase 1 segue em 3 — os cuidados iniciais são
 * prescritos 3× ao dia, não 3× na semana.
 */
export function sessionsPerWeekForWeek(protocol: Protocol, week: number): number {
  return (
    weekGuideFor(protocol, week)?.sessions_per_week ??
    phaseForWeek(protocol, week).sessions_per_week
  );
}

const SESSION_PHASE_ORDER: Record<SessionPhase, number> = {
  warmup: 0,
  active: 1,
  peak: 2,
  rest: 3,
};

/**
 * Itens prescritos numa semana, ordenados.
 *
 * Item sem `week_start`/`week_end` vale para a fase inteira — 38 dos 43 itens
 * não precisam declarar nada.
 *
 * Ordenação em duas camadas porque as duas existem no protocolo: a semana 1
 * segue a **ordem editorial da cartilha** (`display_order`), e as fases 2–4
 * seguem o **arco de intensidade** (`session_phase`). Ordem editorial explícita
 * vence; empates caem no índice original, que mantém a ordenação estável.
 */
export function itemsForWeek(phase: ProtocolPhase, week: number): Exercise[] {
  return phase.exercises
    .filter((ex) => week >= (ex.week_start ?? -Infinity) && week <= (ex.week_end ?? Infinity))
    .map((ex, idx) => ({ ex, idx }))
    .sort((a, b) => {
      const ao = a.ex.display_order;
      const bo = b.ex.display_order;
      if (ao != null && bo != null) return ao - bo || a.idx - b.idx;
      if (ao != null) return -1;
      if (bo != null) return 1;
      const diff =
        SESSION_PHASE_ORDER[a.ex.session_phase ?? "active"] -
        SESSION_PHASE_ORDER[b.ex.session_phase ?? "active"];
      return diff !== 0 ? diff : a.idx - b.idx;
    })
    .map((entry) => entry.ex);
}

/** A fase, com `exercises` recortado para a semana pedida e já ordenado. */
export function phaseForWeekWithItems(protocol: Protocol, week: number): ProtocolPhase {
  const phase = phaseForWeek(protocol, week);
  return { ...phase, exercises: itemsForWeek(phase, week) };
}

/** Sessões prescritas dentro de uma fase, somando as semanas que ela cobre. */
export function sessionsInPhase(protocol: Protocol, phase: ProtocolPhase): number {
  const first = firstWeekOfPhase(protocol, phase);
  let total = 0;
  for (let w = first; w < first + phase.duration_weeks; w++) {
    total += sessionsPerWeekForWeek(protocol, w);
  }
  return total;
}

/**
 * Total de sessões do protocolo, somando **semana a semana**.
 *
 * A versão anterior multiplicava `duration_weeks × sessions_per_week` por fase,
 * o que ignora qualquer semana com cadência própria — e passou a estar errada
 * no instante em que a semana 1 virou diária.
 */
export function totalSessionsForProtocol(protocol: Protocol): number {
  let total = 0;
  for (let week = 1; week <= protocol.total_weeks; week++) {
    total += sessionsPerWeekForWeek(protocol, week);
  }
  return total;
}

/** Sessões prescritas até o fim da semana informada (inclusive). */
export function sessionsThroughWeek(protocol: Protocol, week: number): number {
  let total = 0;
  for (let w = 1; w <= Math.min(week, protocol.total_weeks); w++) {
    total += sessionsPerWeekForWeek(protocol, w);
  }
  return total;
}
