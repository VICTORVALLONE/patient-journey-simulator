import { beforeEach, describe, expect, it } from "vitest";

import { getProtocol } from "@/data/protocols";
import { MVP_ASK_REMINDER, MVP_ASK_SURGERY_DATE } from "@/lib/mvpFlags";
import { postOpWeekOf } from "@/lib/prescription";
import { usePatientStore } from "@/store/patient";

/**
 * Contrato do corte de testes com o cliente (2026-07-28): sem tela de data da
 * cirurgia e sem cadastro de lembrete.
 *
 * O que estes testes protegem não é o valor da flag — é a **consequência** dela.
 * Se alguém religar `MVP_ASK_SURGERY_DATE` sem querer, o teste da semana 1
 * continua passando (a garantia vem do fallback em `started_at`, não da flag) —
 * o que quebra é a asserção explícita da flag, que é onde a decisão está
 * registrada. Ao religar de verdade, estes testes são o lugar de confirmar que a
 * volta é intencional.
 */

beforeEach(() => {
  usePatientStore.getState().startFreshSignup();
});

describe("estacionamento do MVP Piloto", () => {
  it("não pergunta a data da cirurgia nesta rodada", () => {
    expect(MVP_ASK_SURGERY_DATE).toBe(false);
  });

  it("não pergunta horário de lembrete nesta rodada", () => {
    expect(MVP_ASK_REMINDER).toBe(false);
  });
});

describe("todo paciente novo começa na semana 1", () => {
  it("o tratamento nasce sem data de cirurgia", () => {
    const store = usePatientStore.getState();
    store.setTreatmentDraft({ injury_type: "lca", affected_side: "right" });
    const id = store.startTreatment();

    const treatment = usePatientStore.getState().treatments.find((t) => t.id === id)!;
    // `undefined`, não "hoje": a ausência da data é honesta. Gravar hoje como
    // data de cirurgia seria inventar dado clínico para satisfazer o cálculo.
    expect(treatment.surgery_date).toBeUndefined();
    expect(treatment.started_at).toBeTruthy();
  });

  it("cai na semana 1 ancorando no início do tratamento", () => {
    const store = usePatientStore.getState();
    store.setTreatmentDraft({ injury_type: "lca", affected_side: "right" });
    const id = store.startTreatment();

    const treatment = usePatientStore.getState().treatments.find((t) => t.id === id)!;
    const protocol = getProtocol(treatment.protocol_id);
    expect(postOpWeekOf(treatment, protocol, treatment.started_at)).toBe(1);
  });

  it("mas o relógio continua andando: no oitavo dia é semana 2", () => {
    const store = usePatientStore.getState();
    store.setTreatmentDraft({ injury_type: "lca", affected_side: "right" });
    const id = store.startTreatment();

    const treatment = usePatientStore.getState().treatments.find((t) => t.id === id)!;
    const protocol = getProtocol(treatment.protocol_id);
    // O que se travou é o ponto de PARTIDA, não a progressão.
    expect(postOpWeekOf(treatment, protocol, somaDias(treatment.started_at, 7))).toBe(2);
  });

  it("não grava horário de lembrete", () => {
    const store = usePatientStore.getState();
    store.setTreatmentDraft({ injury_type: "lca", affected_side: "right" });
    const id = store.startTreatment();

    const treatment = usePatientStore.getState().treatments.find((t) => t.id === id)!;
    expect(treatment.reminder_time).toBeUndefined();
  });
});

/** Soma dias a uma data ISO sem tropeçar em fuso nem horário de verão. */
function somaDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + dias)).toISOString().slice(0, 10);
}
