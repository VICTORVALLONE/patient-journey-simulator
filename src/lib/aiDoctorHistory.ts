/**
 * Histórico do coach de IA — a **terceira** chave de localStorage do app, ao
 * lado do prontuário (`fisiocare-patient-v2`) e da trava do modo demo.
 *
 * Mora fora da store porque é transcrição de conversa, não estado clínico. Mas
 * por estar fora dela, nenhum dos resets de paciente a tocava: a conversa do
 * paciente-demo atravessava para quem se cadastrasse depois no mesmo navegador,
 * e a conversa de um paciente real atravessava de volta para quem abrisse a
 * demo. Trocar de pessoa tem que apagar isto junto.
 */
export const AI_DOCTOR_STORAGE_KEY = "fisiocare-aidoctor-v1";

export function clearAiDoctorHistory(): void {
  try {
    if (typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.removeItem(AI_DOCTOR_STORAGE_KEY);
  } catch {
    /* sem storage, não há histórico a limpar */
  }
}
