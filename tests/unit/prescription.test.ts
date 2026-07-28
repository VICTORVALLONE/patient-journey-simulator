import { describe, expect, it } from "vitest";

import { getProtocol } from "@/data/protocols";
import {
  itemsForWeek,
  phaseForWeek,
  postOpWeekOf,
  sessionsInPhase,
  sessionsPerWeekForWeek,
  sessionsThroughWeek,
  totalSessionsForProtocol,
} from "@/lib/prescription";
import type { Treatment } from "@/lib/types";

const lca = getProtocol("proto_lca");
const patello = getProtocol("proto_patellofemoral");

function treatment(over: Partial<Treatment> = {}): Treatment {
  return {
    id: "tr_1",
    user_id: "u_1",
    nickname: "Joelho direito (LCA)",
    protocol_id: "proto_lca",
    injury_type: "lca",
    affected_side: "right",
    started_at: "2026-07-01",
    prescribed_by: "Dr. Teste",
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
    ...over,
  };
}

describe("postOpWeekOf", () => {
  it("conta a partir da data da cirurgia", () => {
    const t = treatment({ surgery_date: "2026-07-20" });
    expect(postOpWeekOf(t, lca, "2026-07-20")).toBe(1);
    expect(postOpWeekOf(t, lca, "2026-07-26")).toBe(1);
    expect(postOpWeekOf(t, lca, "2026-07-27")).toBe(2);
  });

  it("cai em started_at quando não há cirurgia (tratamento conservador)", () => {
    const t = treatment({ protocol_id: "proto_patellofemoral", started_at: "2026-07-13" });
    expect(postOpWeekOf(t, patello, "2026-07-27")).toBe(3);
  });

  it("a data da cirurgia vence started_at", () => {
    const t = treatment({ surgery_date: "2026-07-20", started_at: "2026-06-01" });
    expect(postOpWeekOf(t, lca, "2026-07-27")).toBe(2);
  });

  it("não passa do fim do protocolo", () => {
    const t = treatment({ surgery_date: "2020-01-01" });
    expect(postOpWeekOf(t, lca, "2026-07-27")).toBe(lca.total_weeks);
  });

  it("não anda para trás quando o paciente falta", () => {
    // O ponto da mudança: a semana é função da data, não das sessões feitas.
    const faltou = treatment({ surgery_date: "2026-07-01", total_sessions_completed: 0 });
    const assiduo = treatment({ surgery_date: "2026-07-01", total_sessions_completed: 20 });
    expect(postOpWeekOf(faltou, lca, "2026-07-27")).toBe(postOpWeekOf(assiduo, lca, "2026-07-27"));
  });
});

describe("phaseForWeek", () => {
  it("mapeia semanas para fases contíguas", () => {
    expect(phaseForWeek(lca, 1).phase_number).toBe(1);
    expect(phaseForWeek(lca, 2).phase_number).toBe(1); // fase 1 = 2 semanas
    expect(phaseForWeek(lca, 3).phase_number).toBe(2);
    expect(phaseForWeek(lca, 6).phase_number).toBe(2); // fase 2 = 4 semanas
    expect(phaseForWeek(lca, 7).phase_number).toBe(3);
  });

  it("satura na última fase", () => {
    expect(phaseForWeek(lca, 999).phase_number).toBe(lca.phases.length);
  });
});

describe("cadência semanal", () => {
  it("a semana 1 do LCA é diária", () => {
    expect(sessionsPerWeekForWeek(lca, 1)).toBe(7);
  });

  it("a semana 2 volta à cadência da fase", () => {
    expect(sessionsPerWeekForWeek(lca, 2)).toBe(3);
  });

  it("total do LCA sobe de 86 para 90 com a semana 1 diária", () => {
    // 86 era o total com a fase 1 inteira a 3×/semana (6 sessões);
    // agora são 7 + 3 = 10 na fase 1.
    expect(totalSessionsForProtocol(lca)).toBe(90);
  });

  it("sessionsThroughWeek acumula respeitando a semana diária", () => {
    expect(sessionsThroughWeek(lca, 0)).toBe(0);
    expect(sessionsThroughWeek(lca, 1)).toBe(7);
    expect(sessionsThroughWeek(lca, 2)).toBe(10);
  });

  it("sessionsInPhase soma as semanas da fase, não multiplica", () => {
    expect(sessionsInPhase(lca, phaseForWeek(lca, 1))).toBe(10);
  });

  it("protocolo sem cadência por semana continua igual ao produto por fase", () => {
    const porFase = patello.phases.reduce(
      (sum, ph) => sum + ph.duration_weeks * ph.sessions_per_week,
      0,
    );
    expect(totalSessionsForProtocol(patello)).toBe(porFase);
  });
});

describe("itemsForWeek — a semana 1 clinicamente correta", () => {
  const fase1 = phaseForWeek(lca, 1);
  const semana1 = itemsForWeek(fase1, 1).map((e) => e.id);
  const semana2 = itemsForWeek(fase1, 2).map((e) => e.id);

  it("traz os 6 itens da cartilha na ordem editorial", () => {
    expect(semana1).toEqual([
      "ex_alongamento_joelho_esticado",
      "ex_crioterapia",
      "ex_mobilizacao_patela",
      "ex_pump_tornozelo",
      "ex_dobrar_joelhos_parede",
      "ex_treino_marcha",
    ]);
  });

  it("não inclui as elevações de perna, que são de semana 2", () => {
    expect(semana1).not.toContain("ex_elevacao_membro");
    expect(semana1).not.toContain("ex_elevacao_lateral");
    expect(semana2).toContain("ex_elevacao_membro");
    expect(semana2).toContain("ex_elevacao_lateral");
  });

  it("dobrar joelhos atravessa as duas semanas", () => {
    expect(semana1).toContain("ex_dobrar_joelhos_parede");
    expect(semana2).toContain("ex_dobrar_joelhos_parede");
  });

  it("os cuidados diários somem na semana 2", () => {
    expect(semana2).not.toContain("ex_crioterapia");
    expect(semana2).not.toContain("ex_treino_marcha");
  });

  it("item sem recorte de semana vale para a fase inteira", () => {
    const fase3 = phaseForWeek(lca, 8);
    const todos = fase3.exercises.length;
    expect(itemsForWeek(fase3, 8)).toHaveLength(todos);
  });

  it("preserva o arco de intensidade onde não há ordem editorial", () => {
    const fase3 = phaseForWeek(lca, 8);
    const ordem = itemsForWeek(fase3, 8).map((e) => e.session_phase ?? "active");
    const rank = { warmup: 0, active: 1, peak: 2, rest: 3 } as const;
    for (let i = 1; i < ordem.length; i++) {
      expect(rank[ordem[i]!]).toBeGreaterThanOrEqual(rank[ordem[i - 1]!]);
    }
  });
});

describe("modelagem clínica dos itens novos", () => {
  const bySlug = Object.fromEntries(phaseForWeek(lca, 1).exercises.map((e) => [e.id, e]));

  it("crioterapia é cuidado, com intervalo mínimo e parada de segurança", () => {
    const gelo = bySlug["ex_crioterapia"]!;
    expect(gelo.kind).toBe("care");
    expect(gelo.duration_seconds).toBe(1800);
    expect(gelo.times_per_day).toBe(3);
    expect(gelo.min_interval_hours).toBe(1);
    expect(gelo.safety_stop).toBeTruthy();
  });

  it("treino de marcha é orientação sem vídeo, com parâmetro do cirurgião", () => {
    const marcha = bySlug["ex_treino_marcha"]!;
    expect(marcha.kind).toBe("instruction");
    expect(marcha.video).toBeUndefined();
    expect(marcha.reps).toBeUndefined();
    expect(marcha.parameter?.key).toBe("load_type");
    expect(marcha.parameter?.options).toHaveLength(3);
    // Nunca vazio: é o que a tela mostra enquanto o cirurgião não definiu.
    expect(marcha.parameter?.fallback_text).toBeTruthy();
  });

  it("bombeamento de tornozelo virou frequência diária, não 3 séries", () => {
    const pump = bySlug["ex_pump_tornozelo"]!;
    expect(pump.sets).toBeUndefined();
    expect(pump.reps).toBe(30);
    expect(pump.times_per_day).toBe(3);
  });

  it("dobrar joelhos tem a cadeira como variante aninhada, não item irmão", () => {
    const dobrar = bySlug["ex_dobrar_joelhos_parede"]!;
    expect(dobrar.variants).toHaveLength(1);
    expect(dobrar.variants?.[0]?.id).toBe("ex_dobrar_joelhos_cadeira");
    // Aninhada: não pode aparecer como item próprio na contagem da semana.
    expect(itemsForWeek(phaseForWeek(lca, 1), 1).map((e) => e.id)).not.toContain(
      "ex_dobrar_joelhos_cadeira",
    );
  });

  it("nenhum id de exercício foi deletado do protocolo", () => {
    // Deletar id deixa dangling em `Session.exercises_completed` persistido.
    const ids = lca.phases.flatMap((p) => p.exercises.map((e) => e.id));
    for (const legado of [
      "ex_mobilizacao_patela",
      "ex_pump_tornozelo",
      "ex_dobrar_joelhos_parede",
      "ex_elevacao_membro",
      "ex_elevacao_lateral",
    ]) {
      expect(ids).toContain(legado);
    }
  });
});
