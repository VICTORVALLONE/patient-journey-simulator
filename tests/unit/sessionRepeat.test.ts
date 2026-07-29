import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { lockDemo, unlockDemo } from "@/lib/demoMode";
import { usePatientStore } from "@/store/patient";

/**
 * Guarda de 1 sessão/dia (2026-07-28): para o PACIENTE ela é inegociável — é o
 * que mantém a adesão honesta (dias, não doses). Para o MÉDICO, o modo demo a
 * levanta, para exercitar a medição sem esperar o calendário. Estes testes
 * fixam os dois lados da regra.
 */

// O runner é `environment: "node"`: sem localStorage. O stub é o mínimo que
// `lib/demoMode` toca (mesmo padrão de tests/unit/demoMode.test.ts).
function stubStorage(): void {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
      clear: () => data.clear(),
      key: () => null,
      length: 0,
    } satisfies Storage,
  });
}

function iniciarTratamento(): void {
  const store = usePatientStore.getState();
  store.startFreshSignup();
  store.setTreatmentDraft({ injury_type: "lca", affected_side: "right" });
  store.startTreatment();
}

function concluirSessao() {
  return usePatientStore.getState().completeSession({
    pain_level: 5,
    difficulty_rating: 2,
    duration_minutes: 20,
    exercises_completed: [],
  });
}

beforeEach(() => {
  stubStorage();
  lockDemo();
  iniciarTratamento();
});

afterEach(() => {
  lockDemo();
  Reflect.deleteProperty(globalThis, "localStorage");
});

function totalSessoes(): number {
  return usePatientStore.getState().treatments[0]!.sessions.length;
}

describe("guarda de 1 sessão por dia", () => {
  it("paciente: a segunda sessão do mesmo dia é no-op", () => {
    concluirSessao();
    concluirSessao();
    expect(totalSessoes()).toBe(1);
    expect(usePatientStore.getState().treatments[0]!.total_sessions_completed).toBe(1);
  });

  it("modo demo destravado: a repetição grava de verdade", () => {
    unlockDemo();
    concluirSessao();
    concluirSessao();
    concluirSessao();
    expect(totalSessoes()).toBe(3);
    expect(usePatientStore.getState().treatments[0]!.total_sessions_completed).toBe(3);
  });

  it("repetição em demo NÃO infla o streak de dias — dias, não doses", () => {
    unlockDemo();
    concluirSessao();
    concluirSessao();
    const t = usePatientStore.getState().treatments[0]!;
    expect(t.current_day_streak).toBe(1);
    expect(t.longest_day_streak).toBe(1);
  });

  it("repetição em demo acumula no histórico de dor da semana", () => {
    unlockDemo();
    concluirSessao();
    concluirSessao();
    const t = usePatientStore.getState().treatments[0]!;
    const semana1 = t.pain_history.find((p) => p.week === 1)!;
    expect(semana1.session_count).toBe(2);
  });

  it("travar o demo de volta reativa a guarda no mesmo dia", () => {
    unlockDemo();
    concluirSessao();
    concluirSessao();
    lockDemo();
    concluirSessao();
    expect(totalSessoes()).toBe(2);
  });
});
