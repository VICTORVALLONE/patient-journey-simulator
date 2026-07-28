import {
  createFileRoute,
  Outlet,
  useChildMatches,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Clock, Dumbbell, PlayCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveTreatment, todaySessionInfoOf } from "@/store/patient";
import { getProtocol, getWeekGuide } from "@/data/protocols";
import { postOpWeekOf } from "@/lib/prescription";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/types";

export const Route = createFileRoute("/_app/session/$sid")({
  head: () => ({ meta: [{ title: "Visão da sessão · FisioApp" }] }),
  component: SessionOverview,
});

const phaseLabel: Record<string, string> = {
  warmup: "Aquecimento",
  active: "Ativo",
  peak: "Pico",
  rest: "Descanso",
};

/**
 * Linha de item na visão da sessão. Mostra a frequência diária quando existe:
 * "30 min · 3× ao dia" é a prescrição inteira da cartilha para a crioterapia, e
 * omitir o "3×" transformaria a instrução em outra coisa.
 */
function SessionItemRow({ exercise, index }: { exercise: Exercise; index: number }) {
  const parts: string[] = [];
  if (exercise.duration_seconds) {
    parts.push(`${Math.round(exercise.duration_seconds / 60) || 1} min`);
  } else if (exercise.reps) {
    parts.push(exercise.sets ? `${exercise.sets}×${exercise.reps}` : `${exercise.reps}×`);
  }
  if (exercise.times_per_day) parts.push(`${exercise.times_per_day}× ao dia`);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{exercise.name}</p>
        {parts.length > 0 && <p className="text-xs text-muted-foreground">{parts.join(" · ")}</p>}
      </div>
      {exercise.safety_stop && (
        <AlertTriangle
          className="h-4 w-4 shrink-0 text-warning"
          aria-label="Tem orientação de segurança"
        />
      )}
    </div>
  );
}

function SessionOverview() {
  const navigate = useNavigate();
  const childMatches = useChildMatches();
  const treatment = useActiveTreatment();
  if (childMatches.length > 0) return <Outlet />;
  if (!treatment) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Nenhum tratamento ativo.{" "}
        <Link to="/home" className="text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }
  const today = todaySessionInfoOf(treatment);
  const protocol = getProtocol(treatment.protocol_id);
  const currentWeek = postOpWeekOf(treatment, protocol);
  const weekGuide = getWeekGuide(protocol, currentWeek);

  const grouped = (["warmup", "active", "peak", "rest"] as const).map((p) => ({
    phase: p,
    items: today.phase.exercises.filter((e) => e.session_phase === p),
  }));

  // Semanas sem arco de intensidade (a semana 1 é uma lista de cuidados na
  // ordem da cartilha) caem numa lista plana. Agrupar por aquecimento/pico ali
  // inventaria estrutura — e, pior, sumiria com todo item sem `session_phase`.
  const hasArc = grouped.some((g) => g.items.length > 0);

  const totalMinutes = today.phase.exercises.reduce(
    (sum: number, ex) =>
      sum +
      (ex.duration_seconds
        ? Math.round(ex.duration_seconds / 60)
        : Math.round(((ex.sets ?? 3) * (ex.reps ?? 12) * 3) / 60)),
    0,
  );

  const firstExercise = today.phase.exercises[0];

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="flex items-center gap-2">
        <button
          onClick={() => navigate({ to: "/exercises" })}
          className="rounded-full p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Fase {today.phase.phase_number}</p>
          <p className="text-sm font-semibold">
            Sessão {today.sessionNumber} de {today.sessionsInPhase}
          </p>
        </div>
      </header>

      <h1 className="mt-5 text-2xl font-bold leading-tight text-foreground">{today.phase.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{today.phase.focus}</p>

      {weekGuide && (
        <div className="mt-4 rounded-2xl border border-primary/15 bg-primary-muted p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark">
              Semana {currentWeek} · Meta do protocolo
            </p>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-foreground">
            {weekGuide.rom_target_label}
          </p>
          {weekGuide.milestones[0] && (
            <p className="mt-1 text-xs text-muted-foreground">{weekGuide.milestones[0]}</p>
          )}
          {weekGuide.caution && (
            <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-warning/10 p-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <p className="text-xs leading-snug text-foreground/80">{weekGuide.caution}</p>
            </div>
          )}
        </div>
      )}

      {hasArc && (
        <>
          <div className="mt-5 flex h-2 overflow-hidden rounded-full">
            {grouped.map((g, i) => (
              <div
                key={g.phase}
                className={cn(
                  "h-full",
                  g.items.length === 0
                    ? "bg-muted"
                    : i === 0
                      ? "bg-primary/40"
                      : i === 1
                        ? "bg-primary/70"
                        : i === 2
                          ? "bg-primary"
                          : "bg-success",
                )}
                style={{ flex: Math.max(1, g.items.length) }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium uppercase text-muted-foreground">
            <span>Aquec</span>
            <span>Ativo</span>
            <span>Pico</span>
            <span>Descanso</span>
          </div>
        </>
      )}

      <div className="mt-6 space-y-4">
        {hasArc
          ? grouped
              .filter((g) => g.items.length > 0)
              .map((g) => (
                <div key={g.phase}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {phaseLabel[g.phase]}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {g.items.map((ex, idx) => (
                      <SessionItemRow key={ex.id} exercise={ex} index={idx} />
                    ))}
                  </div>
                </div>
              ))
          : today.phase.exercises.map((ex, idx) => (
              <SessionItemRow key={ex.id} exercise={ex} index={idx} />
            ))}
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-2xl bg-bg-subtle p-4">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Dumbbell className="h-4 w-4 text-primary" /> {today.phase.exercises.length} itens
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Clock className="h-4 w-4 text-primary" /> ~{totalMinutes} min
        </div>
      </div>

      {firstExercise && (
        <Link to="/session/$sid/exercise/$eid" params={{ sid: "today", eid: firstExercise.id }}>
          <Button size="lg" className="mt-6 w-full rounded-xl">
            <PlayCircle className="mr-2 h-5 w-5" /> Começar sessão
          </Button>
        </Link>
      )}
    </div>
  );
}
