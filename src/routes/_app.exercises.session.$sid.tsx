import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Clock, Dumbbell, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatientStore, todaySessionInfo } from "@/store/patient";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/exercises/session/$sid")({
  head: () => ({ meta: [{ title: "Visão da sessão · FisioCare" }] }),
  component: SessionOverview,
});

const phaseLabel: Record<string, string> = {
  warmup: "Aquecimento",
  active: "Ativo",
  peak: "Pico",
  rest: "Descanso",
};

function SessionOverview() {
  const navigate = useNavigate();
  const progress = usePatientStore((s) => s.progress);
  const prescription = usePatientStore((s) => s.prescription);
  const today = todaySessionInfo(progress, prescription.protocol_id);

  const grouped = (["warmup", "active", "peak", "rest"] as const).map((p) => ({
    phase: p,
    items: today.phase.exercises.filter((e) => e.session_phase === p),
  }));

  const totalMinutes = today.phase.exercises.reduce(
    (sum, ex) =>
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
        <button onClick={() => navigate({ to: "/exercises" })} className="rounded-full p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Fase {today.phase.phase_number}</p>
          <p className="text-sm font-semibold">Sessão {today.sessionNumber} de {today.sessionsInPhase}</p>
        </div>
      </header>

      <h1 className="mt-5 text-2xl font-bold leading-tight text-foreground">{today.phase.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{today.phase.focus}</p>

      <div className="mt-5 flex h-2 overflow-hidden rounded-full">
        {grouped.map((g, i) => (
          <div
            key={g.phase}
            className={cn(
              "h-full",
              g.items.length === 0
                ? "bg-muted"
                : i === 0 ? "bg-primary/40" : i === 1 ? "bg-primary/70" : i === 2 ? "bg-primary" : "bg-success",
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

      <div className="mt-6 space-y-4">
        {grouped.filter((g) => g.items.length > 0).map((g) => (
          <div key={g.phase}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {phaseLabel[g.phase]}
            </p>
            <div className="mt-2 space-y-1.5">
              {g.items.map((ex, idx) => (
                <div key={ex.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.duration_seconds
                        ? `${Math.round(ex.duration_seconds / 60) || 1} min`
                        : `${ex.sets}×${ex.reps}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-2xl bg-bg-subtle p-4">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Dumbbell className="h-4 w-4 text-primary" /> {today.phase.exercises.length} exercícios
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Clock className="h-4 w-4 text-primary" /> ~{totalMinutes} min
        </div>
      </div>

      {firstExercise && (
        <Link
          to="/exercises/session/$sid/exercise/$eid"
          params={{ sid: "today", eid: firstExercise.id }}
        >
          <Button size="lg" className="mt-6 w-full rounded-xl">
            <PlayCircle className="mr-2 h-5 w-5" /> Começar sessão
          </Button>
        </Link>
      )}
    </div>
  );
}