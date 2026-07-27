import { describe, expect, it } from "vitest";
import { entryStage, isWelcomePending, surgeryDateValidity, type EntrySnapshot } from "@/lib/entry";
import type { Treatment } from "@/lib/types";

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

function snapshot(over: Partial<EntrySnapshot> = {}): EntrySnapshot {
  return { isOnboarded: true, treatments: [], activeTreatmentId: null, ...over };
}

describe("isWelcomePending", () => {
  it("is pending for a brand new treatment", () => {
    expect(isWelcomePending(treatment())).toBe(true);
  });

  it("is not pending once the screen was completed", () => {
    expect(isWelcomePending(treatment({ welcome_completed_at: "2026-07-20T10:00:00Z" }))).toBe(
      false,
    );
  });

  it("grandfathers treatments that already have sessions", () => {
    // Sem esta regra, todo localStorage existente seria jogado para
    // /boas-vindas na primeira carga depois do deploy.
    expect(isWelcomePending(treatment({ total_sessions_completed: 24 }))).toBe(false);
  });

  it("is not pending when there is no treatment", () => {
    expect(isWelcomePending(null)).toBe(false);
  });
});

describe("entryStage", () => {
  it("sends a fresh visitor to the splash", () => {
    expect(entryStage(snapshot({ isOnboarded: false }))).toBe("welcome");
  });

  it("resumes an abandoned personal signup", () => {
    expect(
      entryStage(snapshot({ isOnboarded: false, onboardingDraft: { user: { name: "Victor" } } })),
    ).toBe("personal");
  });

  it("treats an empty draft as no draft", () => {
    expect(entryStage(snapshot({ isOnboarded: false, onboardingDraft: { user: {} } }))).toBe(
      "welcome",
    );
  });

  it("asks for a treatment once the person exists", () => {
    expect(entryStage(snapshot())).toBe("treatment");
  });

  it("asks for a treatment when activeTreatmentId dangles", () => {
    expect(entryStage(snapshot({ treatments: [treatment()], activeTreatmentId: "tr_gone" }))).toBe(
      "treatment",
    );
  });

  it("gates on boas-vindas before week 1", () => {
    const t = treatment();
    expect(entryStage(snapshot({ treatments: [t], activeTreatmentId: t.id }))).toBe("boas_vindas");
  });

  it("is ready once boas-vindas is done", () => {
    const t = treatment({ welcome_completed_at: "2026-07-20T10:00:00Z" });
    expect(entryStage(snapshot({ treatments: [t], activeTreatmentId: t.id }))).toBe("ready");
  });
});

describe("surgeryDateValidity", () => {
  const opts = { totalWeeks: 24, today: "2026-07-27" };

  it("reports missing for empty or malformed input", () => {
    for (const v of [undefined, null, "", "27/07/2026", "2026-7-1"]) {
      expect(surgeryDateValidity(v, opts).state).toBe("missing");
    }
  });

  it("blocks a future date", () => {
    const r = surgeryDateValidity("2026-07-28", opts);
    expect(r.state).toBe("future");
    expect(r.canContinue).toBe(false);
  });

  it("accepts today as day 0", () => {
    const r = surgeryDateValidity("2026-07-27", opts);
    expect(r.state).toBe("ok");
    expect(r.daysSinceSurgery).toBe(0);
  });

  it("counts days exactly across a month boundary", () => {
    expect(surgeryDateValidity("2026-06-27", opts).daysSinceSurgery).toBe(30);
  });

  it("warns but allows a date past the end of the protocol", () => {
    // 24 semanas = 168 dias; 169 dias atrás cai fora.
    const r = surgeryDateValidity("2026-02-08", opts);
    expect(r.daysSinceSurgery).toBe(169);
    expect(r.state).toBe("stale");
    expect(r.canContinue).toBe(true);
  });

  it("treats the last day of the protocol as still ok", () => {
    const r = surgeryDateValidity("2026-02-09", opts);
    expect(r.daysSinceSurgery).toBe(168);
    expect(r.state).toBe("ok");
  });
});
