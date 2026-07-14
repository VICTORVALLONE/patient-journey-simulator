import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { ArrowUpRight, Download, Share2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyFrequencyChart } from "@/components/progress/WeeklyFrequencyChart";
import { PainTrendChart } from "@/components/progress/PainTrendChart";
import { BadgeStrip } from "@/components/progress/BadgeStrip";
import { TreatmentTimeline } from "@/components/progress/TreatmentTimeline";
import { usePatientStore, useActiveTreatment } from "@/store/patient";
import {
  getEvolutionMessage,
  painReductionPct,
  realAdherencePct,
  weeksProgress,
} from "@/lib/dynamicMessages";
import { generateDoctorReport } from "@/lib/pdfReport";
import { getProtocol } from "@/data/protocols";
import { TreatmentSwitcher } from "@/components/treatment/TreatmentSwitcher";
import { EmptyTreatmentState } from "@/components/treatment/EmptyTreatmentState";

export const Route = createFileRoute("/_app/progress")({
  head: () => ({ meta: [{ title: "Progresso · FisioCare" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const user = usePatientStore((s) => s.user);
  const treatment = useActiveTreatment();

  if (!treatment) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Seu progresso</h1>
        <EmptyTreatmentState />
      </div>
    );
  }

  const protocol = getProtocol(treatment.protocol_id);
  const painHistory = treatment.pain_history;
  const painTrendDown =
    painHistory.length >= 2 &&
    (painHistory[painHistory.length - 1]?.average_pain ?? 0) < (painHistory[0]?.average_pain ?? 0);
  const reduction = painReductionPct(treatment);
  const adherence = realAdherencePct(treatment);
  const weeks = weeksProgress(treatment);

  // Variação real de frequência: sessões nos últimos 7 dias vs. 7 dias anteriores.
  const now = Date.now();
  const countIn = (fromDaysAgo: number, toDaysAgo: number) =>
    treatment.sessions.filter((s) => {
      const t = new Date(`${s.scheduled_date}T00:00:00`).getTime();
      return t > now - fromDaysAgo * 86400000 && t <= now - toDaysAgo * 86400000;
    }).length;
  const thisWeekCount = countIn(7, 0);
  const prevWeekCount = countIn(14, 7);
  const weekDelta =
    prevWeekCount > 0 ? Math.round(((thisWeekCount - prevWeekCount) / prevWeekCount) * 100) : null;

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold text-foreground">Seu progresso</h1>
      <p className="text-sm text-muted-foreground">{treatment.nickname}</p>

      <TreatmentSwitcher />

      <section className="mt-5 rounded-3xl bg-primary-navy p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Visão geral da evolução
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight">{getEvolutionMessage(treatment)}</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-white/85">
          <div>
            <p className="text-xl font-bold text-white">
              {reduction !== null ? `${reduction}%` : "—"}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-white/60">↓ dor</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {weeks.done}/{weeks.total}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-white/60">semanas</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {treatment.total_sessions_completed}/{treatment.total_sessions_prescribed}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-white/60">sessões</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
          <span>Adesão real (vs. esperado)</span>
          <span className="font-semibold text-white">{adherence}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div className="h-full bg-white" style={{ width: `${adherence}%` }} />
        </div>
        <Button
          variant="outline"
          className="mt-4 w-full rounded-xl border-white/40 bg-white/10 text-white hover:bg-white/20"
          onClick={() => generateDoctorReport(user, treatment, protocol.name)}
        >
          <Share2 className="mr-2 h-4 w-4" /> Compartilhar com médico (PDF)
        </Button>
      </section>

      <section className="mt-6">
        <TreatmentTimeline treatment={treatment} protocol={protocol} />
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-foreground">Conquistas</h3>
          <span className="text-xs text-muted-foreground">
            {treatment.badges_unlocked.length} desbloqueadas
          </span>
        </div>
        <div className="mt-3">
          <BadgeStrip unlocked={treatment.badges_unlocked} />
        </div>
        <p className="mt-1 text-xs italic text-muted-foreground">
          "O movimento é o seu melhor remédio."
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Frequência semanal</h3>
          {weekDelta !== null && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${weekDelta >= 0 ? "text-success" : "text-muted-foreground"}`}
            >
              <TrendingUp className="h-3 w-3" />
              {weekDelta >= 0 ? "+" : ""}
              {weekDelta}% vs semana anterior
            </span>
          )}
        </div>
        <div className="mt-2">
          <ClientOnly fallback={<div className="h-48 w-full" />}>
            <WeeklyFrequencyChart data={treatment.weekly_frequency} />
          </ClientOnly>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Nível de dor</h3>
          <span
            className={`flex items-center gap-1 text-xs font-medium ${painTrendDown ? "text-success" : "text-muted-foreground"}`}
          >
            <TrendingDown className="h-3 w-3" />{" "}
            {painTrendDown ? "Tendência de queda" : "Aguardando dados"}
          </span>
        </div>
        <div className="mt-2">
          {painHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Complete sua primeira sessão para começar a registrar a dor.
            </p>
          ) : (
            <ClientOnly fallback={<div className="h-48 w-full" />}>
              <PainTrendChart data={painHistory} />
            </ClientOnly>
          )}
        </div>
      </section>

      <section className="mt-6 mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Atividade recente</h3>
          {treatment.sessions.length > 4 && (
            <Link
              to="/exercises"
              className="flex items-center gap-1 text-xs font-medium text-primary"
            >
              Ver histórico <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        <div className="mt-2 space-y-2">
          {treatment.sessions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
              Sem sessões registradas ainda.
            </p>
          ) : (
            treatment.sessions.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="rounded-xl bg-primary-muted p-2 text-primary">
                  <Download className="h-4 w-4 -rotate-90" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Sessão {s.session_number} · Fase {s.phase_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.completed_at ?? s.scheduled_date).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
