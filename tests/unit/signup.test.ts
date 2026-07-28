import { beforeEach, describe, expect, it } from "vitest";

import { MOCK_USER } from "@/data/mockUser";
import { entryStage } from "@/lib/entry";
import { usePatientStore } from "@/store/patient";

/**
 * Regressão dos vazamentos que faziam o MVP entregar ao médico um app com o
 * paciente-demo dentro. Cada teste aqui corresponde a um caminho pelo qual o
 * Alexandre chegava até alguém que nunca pediu por ele.
 */

function estagioAtual() {
  const s = usePatientStore.getState();
  return entryStage({
    isOnboarded: s.isOnboarded,
    treatments: s.treatments,
    activeTreatmentId: s.activeTreatmentId,
    onboardingDraft: s.onboardingDraft,
  });
}

beforeEach(() => {
  usePatientStore.getState().startFreshSignup();
});

describe("o app que o paciente novo recebe", () => {
  it("não traz nenhum tratamento", () => {
    const s = usePatientStore.getState();
    expect(s.treatments).toHaveLength(0);
    expect(s.activeTreatmentId).toBeNull();
  });

  it("não traz identidade de ninguém", () => {
    const { user } = usePatientStore.getState();
    expect(user.name).toBe("");
    expect(user.phone).toBeUndefined();
    expect(user.email).toBeUndefined();
    expect(user.avatar_url).toBeUndefined();
  });

  it("começa a jornada no /welcome", () => {
    expect(estagioAtual()).toBe("welcome");
  });
});

describe("cadastro pessoal", () => {
  beforeEach(() => {
    const store = usePatientStore.getState();
    store.setPersonalDraft({
      name: "Joana Ribeiro",
      birth_date: "1992-03-08",
      weight_kg: 62,
      height_cm: 165,
      recovery_goal: "sports",
    });
    store.completePersonalOnboarding();
  });

  it("não herda telefone, e-mail nem foto do paciente-demo", () => {
    // Este era o vazamento que chegava ao PDF "compartilhar com médico":
    // o relatório de Joana saía assinado com alexandre@email.com.
    const { user } = usePatientStore.getState();
    expect(user.name).toBe("Joana Ribeiro");
    expect(user.phone).toBeUndefined();
    expect(user.email).toBeUndefined();
    expect(user.avatar_url).toBeUndefined();
    expect(user.id).not.toBe(MOCK_USER.id);
  });

  it("guarda o que o cadastro realmente perguntou", () => {
    const { user } = usePatientStore.getState();
    expect(user.birth_date).toBe("1992-03-08");
    expect(user.weight_kg).toBe(62);
    expect(user.height_cm).toBe(165);
    expect(user.recovery_goal).toBe("sports");
  });

  it("um F5 aqui pede o tratamento, nunca cai na home de outra pessoa", () => {
    // Antes, `activeTreatmentId` ainda apontava para um mock já com
    // `welcome_completed_at`, então o estágio era "ready" e o guard mandava o
    // recém-cadastrado direto para a home do Alexandre. A jornada só funcionava
    // porque a tela navegava à mão.
    expect(estagioAtual()).toBe("treatment");
  });
});

describe("primeiro tratamento", () => {
  beforeEach(() => {
    const store = usePatientStore.getState();
    store.setPersonalDraft({ name: "Joana Ribeiro" });
    store.completePersonalOnboarding();
    usePatientStore.getState().setTreatmentDraft({ injury_type: "lca", affected_side: "left" });
    usePatientStore.getState().startTreatment();
  });

  it("deixa exatamente um tratamento", () => {
    expect(usePatientStore.getState().treatments).toHaveLength(1);
  });

  it("gateia as boas-vindas antes da semana 1", () => {
    expect(estagioAtual()).toBe("boas_vindas");
  });

  it("um segundo tratamento preserva o primeiro", () => {
    // Trava contra a correção errada: o prepend em `startTreatment` não era o
    // bug dos 4 tratamentos (a semente era), e mexer nele quebraria
    // multi-tratamento, que é feature viva.
    usePatientStore.getState().setTreatmentDraft({ injury_type: "lca", affected_side: "right" });
    usePatientStore.getState().startTreatment();
    expect(usePatientStore.getState().treatments).toHaveLength(2);
  });
});

describe("a demo continua alcançável", () => {
  it("resetToDemo entrega o paciente-demo com os três tratamentos", () => {
    usePatientStore.getState().resetToDemo();
    const s = usePatientStore.getState();
    expect(s.user.name).toBe(MOCK_USER.name);
    expect(s.treatments).toHaveLength(3);
    expect(s.isOnboarded).toBe(true);
    // Já com as boas-vindas carimbadas: quem abre /demo não topa com o gate.
    expect(estagioAtual()).toBe("ready");
  });

  it("sair do cadastro zera também o usuário", () => {
    // `startFreshSignup` não zerava o `user` apesar do nome, e o objeto do
    // paciente anterior ficava na store esperando alguém lê-lo.
    usePatientStore.getState().resetToDemo();
    usePatientStore.getState().startFreshSignup();
    const { user, treatments } = usePatientStore.getState();
    expect(user.name).toBe("");
    expect(user.avatar_url).toBeUndefined();
    expect(treatments).toHaveLength(0);
  });

  it("resetToInitial esvazia os tratamentos sem trocar quem você é", () => {
    const store = usePatientStore.getState();
    store.setPersonalDraft({ name: "Joana Ribeiro" });
    store.completePersonalOnboarding();
    usePatientStore.getState().resetToInitial();
    const s = usePatientStore.getState();
    expect(s.treatments).toHaveLength(0);
    expect(s.user.name).toBe("Joana Ribeiro");
  });
});
