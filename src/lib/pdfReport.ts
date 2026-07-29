import type { Treatment, User } from "@/lib/types";
import { BADGES } from "@/data/badges";
import { realAdherencePct } from "@/lib/dynamicMessages";
import { ageFromBirthDate } from "@/lib/user";

/**
 * Linha de identificação do paciente. Junta **só o que existe**.
 *
 * O cadastro nunca pede telefone nem e-mail; esses campos só tinham valor
 * porque todo usuário herdava o mock. Concatenar às cegas imprimia
 * "Fulano · undefined · undefined" — num PDF que vai para o prontuário.
 *
 * Puro e exportado para poder ser testado sem carregar o jspdf.
 */
export function patientIdentityLine(user: User): string {
  return [user.name.trim(), user.email?.trim(), user.phone?.trim()].filter(Boolean).join(" · ");
}

/** Linha de biometria, pelo mesmo critério: campo ausente não vira `NaN` nem `0`. */
export function patientBiometricsLine(user: User, today: Date = new Date()): string {
  const age = ageFromBirthDate(user.birth_date, today);
  return [
    age !== null ? `Idade: ${age} anos` : null,
    user.weight_kg ? `Peso: ${user.weight_kg} kg` : null,
    user.height_cm ? `Altura: ${user.height_cm} cm` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function generateDoctorReport(
  user: User,
  treatment: Treatment,
  protocolName: string,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 56;

  doc.setFillColor(15, 28, 71);
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FisioApp — Relatório de Evolução", 40, 50);

  y = 110;
  doc.setTextColor(15, 22, 41);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Paciente", 40, y);
  doc.setFont("helvetica", "normal");
  y += 18;
  doc.text(patientIdentityLine(user), 40, y);
  y += 16;
  doc.text(patientBiometricsLine(user), 40, y);
  y += 28;

  doc.setFont("helvetica", "bold");
  doc.text("Tratamento", 40, y);
  doc.setFont("helvetica", "normal");
  y += 18;
  doc.text(`Apelido: ${treatment.nickname}`, 40, y);
  y += 16;
  doc.text(`Protocolo: ${protocolName}`, 40, y);
  y += 16;
  doc.text(`Status: ${treatment.status}`, 40, y);
  y += 16;
  doc.text(`Prescrito por: ${treatment.prescribed_by}`, 40, y);
  y += 16;
  doc.text(
    `Início: ${treatment.started_at}${treatment.completed_at ? ` · Fim: ${treatment.completed_at}` : ""} · Lado: ${treatment.affected_side}`,
    40,
    y,
  );
  y += 28;

  doc.setFont("helvetica", "bold");
  doc.text("Indicadores", 40, y);
  doc.setFont("helvetica", "normal");
  y += 18;
  doc.text(
    `Sessões: ${treatment.total_sessions_completed} de ${treatment.total_sessions_prescribed} (adesão: ${realAdherencePct(treatment)}%)`,
    40,
    y,
  );
  y += 16;
  doc.text(
    `Dias seguidos de sessão: ${treatment.current_day_streak ?? 0} (melhor: ${treatment.longest_day_streak ?? 0}) · Semanas na meta: ${treatment.current_streak}`,
    40,
    y,
  );
  y += 16;
  doc.text(
    `Fase atual: ${treatment.current_phase} · Fases concluídas: ${treatment.phases_completed.join(", ") || "—"}`,
    40,
    y,
  );
  y += 28;

  doc.setFont("helvetica", "bold");
  doc.text("Evolução da dor (média semanal, 0–10)", 40, y);
  doc.setFont("helvetica", "normal");
  y += 18;
  for (const entry of treatment.pain_history) {
    doc.text(
      `Semana ${entry.week}: ${entry.average_pain.toFixed(1)} (${entry.session_count} sessões)`,
      50,
      y,
    );
    y += 14;
  }
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.text("Conquistas desbloqueadas", 40, y);
  doc.setFont("helvetica", "normal");
  y += 18;
  for (const id of treatment.badges_unlocked) {
    const b = BADGES[id];
    if (!b) continue;
    doc.text(`• ${b.name} — ${b.description}`, 50, y);
    y += 14;
  }

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Gerado em ${new Date().toLocaleString("pt-BR")} · FisioApp`,
    40,
    doc.internal.pageSize.getHeight() - 30,
  );

  const slug = treatment.nickname
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  doc.save(`fisiocare-relatorio-${slug || "tratamento"}.pdf`);
}
