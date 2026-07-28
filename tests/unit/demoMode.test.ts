import { afterEach, describe, expect, it } from "vitest";

import { isDemoUnlocked, lockDemo, unlockDemo } from "@/lib/demoMode";

/**
 * O runner roda em `environment: "node"` — não há DOM nem `localStorage`. O
 * stub abaixo é o mínimo que a API do módulo toca, e a própria ausência dele é
 * um dos casos testados (SSR).
 */
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

function removeStorage(): void {
  Reflect.deleteProperty(globalThis, "localStorage");
}

afterEach(removeStorage);

describe("modo demo", () => {
  it("nasce travado — o médico recebe o app limpo", () => {
    stubStorage();
    expect(isDemoUnlocked()).toBe(false);
  });

  it("destrava e persiste entre leituras", () => {
    stubStorage();
    unlockDemo();
    expect(isDemoUnlocked()).toBe(true);
    expect(isDemoUnlocked()).toBe(true);
  });

  it("trava de volta", () => {
    stubStorage();
    unlockDemo();
    lockDemo();
    expect(isDemoUnlocked()).toBe(false);
  });

  it("sem localStorage (SSR) responde travado em vez de explodir", () => {
    // O módulo é importado no servidor durante o SSR do `dev`; ler no import
    // ou não guardar o acesso derrubaria a renderização.
    removeStorage();
    expect(() => isDemoUnlocked()).not.toThrow();
    expect(isDemoUnlocked()).toBe(false);
    expect(() => unlockDemo()).not.toThrow();
    expect(() => lockDemo()).not.toThrow();
  });

  it("valor corrompido conta como travado", () => {
    // Falhar para o lado do produto, nunca para o lado das ferramentas internas.
    stubStorage();
    globalThis.localStorage.setItem("fisioapp-demo-mode-v1", "talvez");
    expect(isDemoUnlocked()).toBe(false);
  });
});
