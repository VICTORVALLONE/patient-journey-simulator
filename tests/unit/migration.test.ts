import { describe, expect, it } from "vitest";

import { getProtocol } from "@/data/protocols";
import { totalSessionsForProtocol } from "@/lib/prescription";
import { migrateTreatmentToV4 } from "@/store/patient";
import type { Treatment } from "@/lib/types";

/**
 * Payload v3 real: LCA com o total ANTIGO (86 = 2×3 + 4×4 + 10×4 + 8×4), de
 * antes de a semana 1 virar diária.
 */
function v3Treatment(over: Partial<Treatment> = {}): Treatment {
  return {
    id: "tr_v3",
    user_id: "u_v3",
    nickname: "Joelho direito (LCA)",
    protocol_id: "proto_lca",
    injury_type: "lca",
    affected_side: "right",
    started_at: "2026-05-01",
    prescribed_by: "Dr. Carlos Mendes",
    status: "active",
    current_phase: 2,
    phases_completed: [1],
    badges_unlocked: ["first_session", "week_1"],
    total_sessions_prescribed: 86,
    total_sessions_completed: 24,
    adherence_rate: 28,
    current_streak: 3,
    longest_streak: 5,
    pain_history: [],
    weekly_frequency: [],
    sessions: [],
    ...over,
  };
}

describe("migração v3 → v4", () => {
  it("recalcula o total do LCA de 86 para 90", () => {
    const out = migrateTreatmentToV4(v3Treatment());
    expect(out.total_sessions_prescribed).toBe(90);
  });

  it("reajusta a adesão ao novo denominador", () => {
    const out = migrateTreatmentToV4(v3Treatment());
    expect(out.adherence_rate).toBe(Math.round((24 / 90) * 100));
  });

  it("não mexe em nada além do total e da adesão", () => {
    const antes = v3Treatment();
    const depois = migrateTreatmentToV4(antes);
    const { total_sessions_prescribed: _t1, adherence_rate: _a1, ...restoAntes } = antes;
    const { total_sessions_prescribed: _t2, adherence_rate: _a2, ...restoDepois } = depois;
    expect(restoDepois).toEqual(restoAntes);
  });

  it("deixa tratamento CONCLUÍDO intacto", () => {
    // Recalcular o denominador de quem terminou desligaria o badge
    // `protocol_complete` — conquista sumindo por mudança de conteúdo.
    const concluido = v3Treatment({
      status: "completed",
      total_sessions_completed: 86,
      adherence_rate: 100,
      badges_unlocked: ["protocol_complete"],
    });
    expect(migrateTreatmentToV4(concluido)).toEqual(concluido);
  });

  it("é idempotente: rodar de novo não muda nada", () => {
    const uma = migrateTreatmentToV4(v3Treatment());
    expect(migrateTreatmentToV4(uma)).toEqual(uma);
  });

  it("preserva o mesmo objeto quando o total já está certo", () => {
    const atual = v3Treatment({ total_sessions_prescribed: 90 });
    expect(migrateTreatmentToV4(atual)).toBe(atual);
  });

  it("protocolo conservador não muda de total", () => {
    // O patelofemoral não tem semana com cadência própria, então v3 e v4 batem
    // e a migração devolve o mesmo objeto.
    const total = totalSessionsForProtocol(getProtocol("proto_patellofemoral"));
    const patello = v3Treatment({
      protocol_id: "proto_patellofemoral",
      injury_type: "patellofemoral",
      total_sessions_prescribed: total,
    });
    expect(migrateTreatmentToV4(patello)).toBe(patello);
  });
});
