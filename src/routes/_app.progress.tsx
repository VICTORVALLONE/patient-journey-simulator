import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Download, Share2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyFrequencyChart } from "@/components/progress/WeeklyFrequencyChart";
import { PainTrendChart } from "@/components/progress/PainTrendChart";
import { BadgeStrip } from "@/components/progress/BadgeStrip";
import { usePatientStore } from "@/store/patient";
import { getEvolutionMessage } from "@/lib/dynamicMessages";
import { generateDoctorReport } from "@/lib/pdfReport";
import { getProtocol } from "@/data/protocols";

export const Route = createFileRoute("/_app/progress")({
  head: () => ({ meta: [{ title: "Progresso · FisioCare" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const user = usePatientStore((s) => s.user);
  const prescription = usePatientStore((s) => s.prescription);
  const progress = usePatientStore((s) => s.progress);
  const sessions = usePatientStore((s) => s.sessions);
  const protocol = getProtocol(prescription.protocol_id);

  const painHistory = progress.pain_history;
  const painTrendDown =
    painHistory.length >= 2 &&
    (painHistory[painHistory.length - 1]?.average_pain ?? 0) <
      (painHistory[0]?.average_pain ?? 0);

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold text-foreground">Seu progresso</h1>
      <p className="text-sm text-muted-foreground">Evidência do seu trabalho.</p>

      <section className="mt-5 rounded-3xl bg-primary-navy p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Visão geral da evolução
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight">
          {getEvolutionMessage(progress)}
        </h2>
        <div className="mt-4 flex gap-4 text-sm text-white/85">
          <div>
            <p className="text-xl font-bold text-white">{progress.total_sessions_completed}</p>
            <p className="text-[11px] uppercase tracking-wide text-white/60">sessões</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{progress.current_streak}</p>
            <p className="text-[11px] uppercase tracking-wide text-white/60">dias seguidos</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{progress.adherence_rate}%</p>
            <p className="text-[11px] uppercase tracking-wide text-white/60">adesão</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4 w-full rounded-xl border-white/40 bg-white/10 text-white hover:bg-white/20"
          onClick={() => generateDoctorReport(user, prescription, progress, protocol.name)}
        >
          <Share2 className="mr-2 h-4 w-4" /> Compartilhar com médico (PDF)
        </Button>
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-foreground">Conquistas</h3>
          <span className="text-xs text-muted-foreground">{progress.badges_unlocked.length} desbloqueadas</span>
        </div>
        <div className="mt-3">
          <BadgeStrip unlocked={progress.badges_unlocked} />
        </div>
        <p className="mt-1 text-xs italic text-muted-foreground">"O movimento é o seu melhor remédio."</p>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Frequência semanal</h3>
          <span className="flex items-center gap-1 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" /> +12% vs semana anterior
          </span>
        </div>
        <div className="mt-2">
          <WeeklyFrequencyChart data={progress.weekly_frequency} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Nível de dor</h3>
          <span className={`flex items-center gap-1 text-xs font-medium ${painTrendDown ? "text-success" : "text-muted-foreground"}`}>
            <TrendingDown className="h-3 w-3" /> {painTrendDown ? "Tendência de queda" : "Aguardando dados"}
          </span>
        </div>
        <div className="mt-2">
          {painHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Complete sua primeira sessão para começar a registrar a dor.
            </p>
          ) : (
            <PainTrendChart data={painHistory} />
          )}
        </div>
      </section>

      <section className="mt-6 mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Atividade recente</h3>
          {sessions.length > 4 && (
            <Link to="/exercises" className="flex items-center gap-1 text-xs font-medium text-primary">
              Ver histórico <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        <div className="mt-2 space-y-2">
          {sessions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
              Sem sessões registradas ainda.
            </p>
          ) : (
            sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="rounded-xl bg-primary-muted p-2 text-primary">
                  <Download className="h-4 w-4 -rotate-90" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Sessão {s.session_number} · Fase {s.phase_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.completed_at ?? s.scheduled_date).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Dor {s.pain_level?.toFixed(1)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}