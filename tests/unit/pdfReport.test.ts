import { describe, expect, it } from "vitest";

import { patientBiometricsLine, patientIdentityLine } from "@/lib/pdfReport";
import { EMPTY_USER } from "@/lib/user";
import type { User } from "@/lib/types";

/**
 * O relatório é o único artefato que sai do app e vai para o prontuário. Os
 * helpers são puros e testados sem carregar o jspdf.
 */

function paciente(over: Partial<User> = {}): User {
  return { ...EMPTY_USER, id: "u_1", name: "Joana Ribeiro", ...over };
}

describe("linha de identificação do paciente", () => {
  it("não imprime undefined quando não há e-mail nem telefone", () => {
    // O cadastro nunca pede os dois. Concatenar às cegas saía
    // "Joana Ribeiro · undefined · undefined" no PDF do médico.
    expect(patientIdentityLine(paciente())).toBe("Joana Ribeiro");
  });

  it("junta só os campos presentes, sem separador órfão", () => {
    expect(patientIdentityLine(paciente({ email: "joana@exemplo.com" }))).toBe(
      "Joana Ribeiro · joana@exemplo.com",
    );
  });

  it("imprime tudo quando tudo existe", () => {
    expect(
      patientIdentityLine(paciente({ email: "joana@exemplo.com", phone: "+55 11 90000-0000" })),
    ).toBe("Joana Ribeiro · joana@exemplo.com · +55 11 90000-0000");
  });

  it("ignora campo em branco", () => {
    expect(patientIdentityLine(paciente({ email: "   " }))).toBe("Joana Ribeiro");
  });
});

describe("linha de biometria", () => {
  const hoje = new Date("2026-07-28T12:00:00Z");

  it("imprime idade, peso e altura quando existem", () => {
    const u = paciente({ birth_date: "1992-03-08", weight_kg: 62, height_cm: 165 });
    expect(patientBiometricsLine(u, hoje)).toBe("Idade: 34 anos · Peso: 62 kg · Altura: 165 cm");
  });

  it("não imprime NaN nem zero para dado ausente", () => {
    expect(patientBiometricsLine(paciente(), hoje)).toBe("");
  });

  it("omite só o que falta", () => {
    const u = paciente({ weight_kg: 62 });
    expect(patientBiometricsLine(u, hoje)).toBe("Peso: 62 kg");
  });
});
