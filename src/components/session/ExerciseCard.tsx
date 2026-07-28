import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { thumbnailFor } from "@/data/protocols";
import type { Exercise, SessionPhase } from "@/lib/types";

const phaseLabel: Record<SessionPhase, string> = {
  warmup: "Aquecimento",
  active: "Ativo",
  peak: "Pico",
  rest: "Descanso",
};

/**
 * O chip diz o que o item **é**, não em que fase da sessão ele cai. Um cuidado
 * ou uma orientação não têm arco de intensidade — rotular a crioterapia como
 * "Ativo" seria inventar estrutura que a cartilha não tem.
 */
function itemLabel(exercise: Exercise): string {
  if (exercise.kind === "care") return "Cuidado";
  if (exercise.kind === "instruction") return "Orientação";
  return phaseLabel[exercise.session_phase ?? "active"];
}

/** Resumo numérico do item — vazio quando não há número honesto a mostrar. */
function itemMeta(exercise: Exercise): string | null {
  if (exercise.duration_seconds) {
    return `${Math.round(exercise.duration_seconds / 60) || 1} min`;
  }
  if (exercise.reps) {
    return exercise.sets ? `${exercise.sets}×${exercise.reps}` : `${exercise.reps}×`;
  }
  return null;
}

export function ExerciseCard({
  exercise,
  href,
  status,
}: {
  exercise: Exercise;
  href?: string;
  status?: "done" | "current" | "next";
}) {
  const meta = itemMeta(exercise);
  const timesPerDay = exercise.times_per_day;

  const content = (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img src={thumbnailFor(exercise)} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-dark">
            {itemLabel(exercise)}
          </span>
          {status === "done" && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              Concluído
            </span>
          )}
          {status === "current" && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              Agora
            </span>
          )}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{exercise.name}</h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          {meta && (
            <>
              <span>{meta}</span>
              <span>·</span>
            </>
          )}
          {timesPerDay && (
            <>
              <span>{timesPerDay}× ao dia</span>
              <span>·</span>
            </>
          )}
          <span className="flex items-center gap-0.5">
            {[1, 2, 3].map((d) => (
              <span
                key={d}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  d <= exercise.difficulty ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );

  if (!href) return content;
  return (
    <Link to={href} className="block transition-transform active:scale-[0.98]">
      {content}
    </Link>
  );
}
