import type { Treatment, User } from "@/lib/types";
import { BADGES } from "@/data/badges";

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
  doc.text("FisioCare — Relatório de Evolução", 40, 50);

  y = 110;
  doc.setTextColor(15, 22, 41);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Paciente", 40, y);
  doc.setFont("helvetica", "normal");
  y += 18;
  doc.text(`${user.name} · ${user.email} · ${user.phone}`, 40, y);
  y += 16;
  doc.text(
    `Idade: ${calcAge(user.birth_date)} anos · Peso: ${user.weight_kg} kg · Altura: ${user.height_cm} cm`,
    40,
    y,
  );
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
    `Sessões: ${treatment.total_sessions_completed} de ${treatment.total_sessions_prescribed} (${treatment.adherence_rate}%)`,
    40,
    y,
  );
  y += 16;
  doc.text(`Sequência atual: ${treatment.current_streak} dias · Maior: ${treatment.longest_streak} dias`, 40, y);
  y += 16;
  doc.text(`Fase atual: ${treatment.current_phase} · Fases concluídas: ${treatment.phases_completed.join(", ") || "—"}`, 40, y);
  y += 28;

  doc.setFont("helvetica", "bold");
  doc.text("Evolução da dor (média semanal, 0–10)", 40, y);
  doc.setFont("helvetica", "normal");
  y += 18;
  for (const entry of treatment.pain_history) {
    doc.text(`Semana ${entry.week}: ${entry.average_pain.toFixed(1)} (${entry.session_count} sessões)`, 50, y);
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
    `Gerado em ${new Date().toLocaleString("pt-BR")} · FisioCare`,
    40,
    doc.internal.pageSize.getHeight() - 30,
  );

  const slug = treatment.nickname.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`fisiocare-relatorio-${slug || "tratamento"}.pdf`);
}

function calcAge(iso: string): number {
  const b = new Date(iso);
  const diff = Date.now() - b.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}