import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patient";
import { getProtocol } from "@/data/protocols";
import { BadgeGrid } from "@/components/progress/BadgeGrid";
import { generateDoctorReport } from "@/lib/pdfReport";

export const Route = createFileRoute("/_app/treatments/$tid")({
  head: () => ({ meta: [{ title: "Tratamento · FisioCare" }] }),
  component: TreatmentDetailPage,
});

const STATUS_LABEL = {
  active: "Em andamento",
  completed: "Concluído",
  paused: "Pausado",
} as const;

function TreatmentDetailPage() {
  const navigate = useNavigate();
  const { tid } = useParams({ from: "/_app/treatments/$tid" });
  const user = usePatientStore((s) => s.user);
  const treatment = usePatientStore((s) => s.treatments.find((t) => t.id === tid));
  const setActive = usePatientStore((s) => s.setActiveTreatment);

  if (!treatment) {
    return (
      <div className="px-5 pt-6">
        <p className="text-sm text-muted-foreground">Tratamento não encontrado.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/treatments" })}>
          Voltar
        </Button>
      </div>
    );
  }

  const protocol = getProtocol(treatment.protocol_id);

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="flex items-center gap-2">
        <button onClick={() => navigate({ to: "/treatments" })} className="rounded-full p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {STATUS_LABEL[treatment.status]}
          </p>
          <h1 className="text-lg font-bold text-foreground">{treatment.nickname}</h1>
        </div>
      </header>

      <section className="mt-5 rounded-3xl bg-primary-navy p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Adesão</p>
        <p className="mt-2 text-4xl font-bold">{treatment.adherence_rate}%</p>
        <p className="mt-1 text-sm text-white/80">
          {treatment.total_sessions_completed} de {treatment.total_sessions_prescribed} sessões
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${treatment.adherence_rate}%` }}
          />
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Protocolo" value={protocol.name} />
        <Stat label="Lado" value={
          treatment.affected_side === "right"
            ? "Direito"
            : treatment.affected_side === "left"
              ? "Esquerdo"
              : "Bilateral"
        } />
        <Stat label="Médico" value={treatment.prescribed_by} />
        <Stat
          label="Período"
          value={`${treatment.started_at}${treatment.completed_at ? ` → ${treatment.completed_at}` : ""}`}
        />
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conquistas
        </p>
        <div className="mt-2">
          <BadgeGrid unlocked={treatment.badges_unlocked} />
        </div>
      </section>

      <div className="mt-6 space-y-2">
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => generateDoctorReport(user, treatment, protocol.name)}
        >
          <Share2 className="mr-2 h-4 w-4" /> Compartilhar relatório (PDF)
        </Button>
        {treatment.status === "active" && (
          <Button
            className="w-full rounded-xl"
            onClick={() => {
              setActive(treatment.id);
              navigate({ to: "/home" });
            }}
          >
            Definir como tratamento em foco
          </Button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}