import { MapPin, Calendar, Flag } from "lucide-react";
import type { Protocol, Treatment } from "@/lib/types";

interface Props {
  treatment: Treatment;
  protocol: Protocol;
}

function fmt(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
}

export function TreatmentTimeline({ treatment, protocol }: Props) {
  const totalSessions = protocol.phases.reduce(
    (sum, p) => sum + p.duration_weeks * p.sessions_per_week,
    0,
  );
  const done = Math.min(treatment.total_sessions_completed, totalSessions);
  const progressPct = totalSessions > 0 ? (done / totalSessions) * 100 : 0;

  // Datas-chave
  const start = new Date(treatment.started_at);
  const end = new Date(start.getTime() + protocol.total_weeks * 7 * 86400000);
  const today = new Date();

  // Posição do marcador "hoje" considerando o calendário real (linha do tempo
  // por datas, não por sessões), limitada entre 0 e 100.
  const dayTotal = Math.max(1, end.getTime() - start.getTime());
  const dayDone = Math.min(dayTotal, Math.max(0, today.getTime() - start.getTime()));
  const calendarPct = (dayDone / dayTotal) * 100;

  // Semana atual estimada
  const weeksElapsed = Math.max(
    1,
    Math.min(protocol.total_weeks, Math.ceil(dayDone / (7 * 86400000))),
  );

  // Posição "Você está aqui" — usa progresso real de sessões para refletir
  // o que de fato foi feito.
  const youAreHerePct = Math.max(2, Math.min(98, progressPct));

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">Linha do tempo</h3>
        <span className="text-xs text-muted-foreground">
          Semana {weeksElapsed} de {protocol.total_weeks}
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Sessão {done} de {totalSessions} · {Math.round(progressPct)}% do protocolo
      </p>

      {/* Barra segmentada por fase */}
      <div className="mt-4">
        <div className="relative">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {protocol.phases.map((phase, idx) => {
              const phaseSessions = phase.duration_weeks * phase.sessions_per_week;
              const widthPct = (phaseSessions / totalSessions) * 100;
              // Sessões concluídas dentro desta fase
              const sessionsBefore = protocol.phases
                .slice(0, idx)
                .reduce((s, p) => s + p.duration_weeks * p.sessions_per_week, 0);
              const phaseDone = Math.max(0, Math.min(phaseSessions, done - sessionsBefore));
              const fillPct = phaseSessions > 0 ? (phaseDone / phaseSessions) * 100 : 0;
              return (
                <div
                  key={phase.id}
                  className="relative h-full border-r border-card last:border-r-0"
                  style={{ width: `${widthPct}%` }}
                  title={`${phase.name} — ${phaseDone}/${phaseSessions}`}
                >
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Marcador "Você está aqui" */}
          <div
            className="absolute -top-1 -translate-x-1/2"
            style={{ left: `${youAreHerePct}%` }}
            aria-label="Você está aqui"
          >
            <div className="flex flex-col items-center">
              <div className="h-5 w-0.5 bg-primary-dark" />
              <div className="-mt-1 rounded-full bg-primary-dark p-1 text-white shadow">
                <MapPin className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Labels das fases */}
        <div className="mt-3 flex w-full text-[10px] text-muted-foreground">
          {protocol.phases.map((phase, idx) => {
            const phaseSessions = phase.duration_weeks * phase.sessions_per_week;
            const widthPct = (phaseSessions / totalSessions) * 100;
            const isCurrent = treatment.current_phase === phase.phase_number;
            return (
              <div
                key={phase.id}
                className="px-1"
                style={{ width: `${widthPct}%` }}
              >
                <p
                  className={`truncate font-semibold ${isCurrent ? "text-primary" : "text-foreground/70"}`}
                  title={phase.name}
                >
                  F{idx + 1}
                </p>
                <p className="truncate" title={phase.name}>
                  {phase.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Datas-chave */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        <div className="flex items-start gap-1.5">
          <Calendar className="mt-0.5 h-3 w-3 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">Início</p>
            <p className="font-semibold text-foreground">{fmt(start)}</p>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3 w-3 text-primary" />
          <div>
            <p className="text-muted-foreground">Hoje</p>
            <p className="font-semibold text-foreground">
              {Math.round(calendarPct)}% do tempo
            </p>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <Flag className="mt-0.5 h-3 w-3 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">Previsão</p>
            <p className="font-semibold text-foreground">{fmt(end)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}