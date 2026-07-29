import { describe, expect, it } from "vitest";

import { getProtocol } from "@/data/protocols";
import { checkNewBadges } from "@/lib/badges";
import { computeDayStreak, computeWeeklyStreak, WEEKLY_STREAK_START_WEEK } from "@/lib/streak";
import type { Session, Treatment } from "@/lib/types";

/**
 * Contrato das duas camadas de streak (2026-07-28): dias seguidos é a base,
 * visível desde o dia 1; o semanal só conta a partir da semana pós-op 3.
 * A regra do multi-dose (dia conta UMA vez, mesmo com itens 3× ao dia) é
 * testada por construção: duas sessões no mesmo dia não existem no reducer,
 * e aqui um dia duplicado não infla a contagem.
 */

function session(dateISO: string): Session {
  return {
    id: `s_${dateISO}`,
    treatment_id: "tr_test",
    phase_number: 1,
    session_number: 1,
    scheduled_date: dateISO,
    completed_at: `${dateISO}T10:00:00.000Z`,
    exercises_completed: [],
  };
}

const days = (list: string[]) => list.map(session);

describe("computeDayStreak — dias seguidos", () => {
  it("sem sessão nenhuma: 0/0", () => {
    expect(computeDayStreak([], "2026-07-28")).toEqual({ current: 0, longest: 0 });
  });

  it("três dias consecutivos terminando hoje", () => {
    const s = days(["2026-07-26", "2026-07-27", "2026-07-28"]);
    expect(computeDayStreak(s, "2026-07-28")).toEqual({ current: 3, longest: 3 });
  });

  it("hoje ainda pendente não quebra: a sequência de ontem continua valendo", () => {
    const s = days(["2026-07-26", "2026-07-27"]);
    expect(computeDayStreak(s, "2026-07-28").current).toBe(2);
  });

  it("um dia inteiro em branco quebra a corrente, mas preserva a melhor", () => {
    const s = days(["2026-07-20", "2026-07-21", "2026-07-22", "2026-07-25"]);
    expect(computeDayStreak(s, "2026-07-25")).toEqual({ current: 1, longest: 3 });
  });

  it("dois dias sem sessão zeram a corrente", () => {
    const s = days(["2026-07-24", "2026-07-25"]);
    expect(computeDayStreak(s, "2026-07-28")).toEqual({ current: 0, longest: 2 });
  });

  it("dia duplicado conta uma vez — dias, não doses", () => {
    const s = [...days(["2026-07-27", "2026-07-28"]), session("2026-07-28")];
    expect(computeDayStreak(s, "2026-07-28")).toEqual({ current: 2, longest: 2 });
  });
});

describe("computeWeeklyStreak — semanas na meta, a partir da semana 3", () => {
  const protocol = getProtocol("proto_lca");
  const anchor = "2026-06-01"; // cirurgia; semana 3 começa em 15/06, fase 2 pede 4/semana

  it("antes da semana 3 não existe streak semanal — nem com semana 1 perfeita", () => {
    // 7 dias seguidos na semana 1: streak de DIAS, não de semanas.
    const s = days([1, 2, 3, 4, 5, 6, 7].map((d) => `2026-06-0${d}`));
    expect(computeWeeklyStreak(s, protocol, anchor, "2026-06-10")).toEqual({
      current: 0,
      longest: 0,
    });
  });

  it("semana 3 batendo a meta da FASE (4/semana na fase 2, não os 3 do protocolo)", () => {
    const s = days(["2026-06-15", "2026-06-17", "2026-06-19", "2026-06-21"]);
    expect(computeWeeklyStreak(s, protocol, anchor, "2026-06-24").current).toBe(1);
    // Com só 3 sessões — a meta antiga do protocolo — a semana 3 NÃO bate.
    expect(computeWeeklyStreak(s.slice(0, 3), protocol, anchor, "2026-06-24").current).toBe(0);
  });

  it("semana corrente parcial não quebra a sequência", () => {
    const week3 = ["2026-06-15", "2026-06-17", "2026-06-19", "2026-06-21"];
    const week4 = ["2026-06-22", "2026-06-24", "2026-06-26", "2026-06-27"];
    const s = days([...week3, ...week4, "2026-06-29"]); // semana 5 recém-começada
    expect(computeWeeklyStreak(s, protocol, anchor, "2026-06-30").current).toBe(2);
  });

  it("semana passada sem meta zera a corrente e preserva a melhor", () => {
    const week3 = ["2026-06-15", "2026-06-17", "2026-06-19", "2026-06-21"];
    // semana 4 em branco; semana 5 completa
    const week5 = ["2026-06-29", "2026-07-01", "2026-07-03", "2026-07-05"];
    const r = computeWeeklyStreak(days([...week3, ...week5]), protocol, anchor, "2026-07-06");
    expect(r).toEqual({ current: 1, longest: 1 });
  });
});

describe("badges de marcos de dias", () => {
  const base: Treatment = {
    id: "tr_test",
    user_id: "u",
    nickname: "t",
    protocol_id: "proto_lca",
    injury_type: "lca",
    affected_side: "right",
    started_at: "2026-07-01",
    prescribed_by: "Dr.",
    status: "active",
    current_phase: 1,
    phases_completed: [],
    badges_unlocked: [],
    total_sessions_prescribed: 90,
    total_sessions_completed: 0,
    adherence_rate: 0,
    current_streak: 0,
    longest_streak: 0,
    pain_history: [],
    weekly_frequency: [],
    sessions: [],
  };

  it("10 dias seguidos destravam o marco de sequência", () => {
    const t = { ...base, total_sessions_completed: 10, current_day_streak: 10 };
    expect(checkNewBadges(t, 4)).toContain("streak_days_10");
  });

  it("20 dias completos destravam o marco de total — mesmo sem sequência", () => {
    const t = { ...base, total_sessions_completed: 20, current_day_streak: 1 };
    const badges = checkNewBadges(t, 4);
    expect(badges).toContain("days_complete_20");
    expect(badges).not.toContain("streak_days_10");
  });
});

describe("constante de arranque do streak semanal", () => {
  it("é a semana 3 — mudou aqui, mudou a decisão registrada no DECISIONS.md", () => {
    expect(WEEKLY_STREAK_START_WEEK).toBe(3);
  });
});
