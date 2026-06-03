import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/types";

const phaseLabel: Record<Exercise["session_phase"], string> = {
  warmup: "Aquecimento",
  active: "Ativo",
  peak: "Pico",
  rest: "Descanso",
};

export function ExerciseCard({
  exercise,
  href,
  status,
}: {
  exercise: Exercise;
  href?: string;
  status?: "done" | "current" | "next";
}) {
  const meta = exercise.duration_seconds
    ? `${Math.round(exercise.duration_seconds / 60) || 1} min`
    : `${exercise.sets ?? 3}×${exercise.reps ?? 12}`;

  const content = (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img src={exercise.thumbnail_url} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-dark">
            {phaseLabel[exercise.session_phase]}
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
          <span>{meta}</span>
          <span>·</span>
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