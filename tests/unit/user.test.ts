import { describe, expect, it } from "vitest";

import { MOCK_USER } from "@/data/mockUser";
import { EMPTY_USER, ageFromBirthDate, avatarInitial, firstName, isBlankUser } from "@/lib/user";

describe("EMPTY_USER", () => {
  it("não carrega nenhum campo de identidade do paciente-demo", () => {
    // Era daqui que o telefone, o e-mail e a foto do Alexandre vazavam para
    // quem se cadastrasse: o cadastro fazia spread do mock.
    expect(EMPTY_USER.phone).toBeUndefined();
    expect(EMPTY_USER.email).toBeUndefined();
    expect(EMPTY_USER.avatar_url).toBeUndefined();
    expect(EMPTY_USER.name).not.toBe(MOCK_USER.name);
    expect(EMPTY_USER.id).not.toBe(MOCK_USER.id);
  });

  it("é reconhecido como em branco", () => {
    expect(isBlankUser(EMPTY_USER)).toBe(true);
    expect(isBlankUser(MOCK_USER)).toBe(false);
  });
});

describe("firstName", () => {
  it("devolve o primeiro nome", () => {
    expect(firstName("Maria Silva Souza")).toBe("Maria");
  });

  it("tolera espaços sobrando", () => {
    expect(firstName("  Ana   Paula ")).toBe("Ana");
  });

  it("devolve null sem nome, para a tela decidir o texto neutro", () => {
    // A alternativa era a saudação sair "Bom dia, " com a vírgula solta.
    expect(firstName("")).toBeNull();
    expect(firstName("   ")).toBeNull();
  });
});

describe("avatarInitial", () => {
  it("usa a inicial do primeiro nome, em maiúscula", () => {
    expect(avatarInitial("joana ribeiro")).toBe("J");
  });

  it("nunca devolve vazio — círculo em branco parece defeito", () => {
    expect(avatarInitial("")).toBe("?");
  });
});

describe("ageFromBirthDate", () => {
  const hoje = new Date("2026-07-28T12:00:00Z");

  it("calcula a idade em anos completos", () => {
    expect(ageFromBirthDate("1990-03-15", hoje)).toBe(36);
  });

  it("não conta o aniversário que ainda não chegou", () => {
    expect(ageFromBirthDate("1990-12-31", hoje)).toBe(35);
  });

  it("conta o aniversário do próprio dia", () => {
    expect(ageFromBirthDate("1990-07-28", hoje)).toBe(36);
  });

  it("devolve null para data ausente ou inválida", () => {
    // Sem isto, o usuário em branco imprimia "NaN anos" no perfil e no PDF
    // que vai para o médico.
    expect(ageFromBirthDate("", hoje)).toBeNull();
    expect(ageFromBirthDate("não é data", hoje)).toBeNull();
  });
});
