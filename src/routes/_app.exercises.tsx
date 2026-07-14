import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, MessageCircle, ShieldCheck } from "lucide-react";
import { useActiveTreatment, todaySessionInfoOf } from "@/store/patient";
import { getProtocol } from "@/data/protocols";
import { ExerciseCard } from "@/components/session/ExerciseCard";
import { TreatmentSwitcher } from "@/components/treatment/TreatmentSwitcher";
import { EmptyTreatmentState } from "@/components/treatment/EmptyTreatmentState";
import type { BodyRegion } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/exercises")({
  head: () => ({ meta: [{ title: "Exercícios · FisioCare" }] }),
  component: ExercisesPage,
});

const FILTERS: { value: BodyRegion | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "joelho", label: "Joelho" },
  { value: "quadril", label: "Quadril" },
  { value: "tornozelo", label: "Tornozelo" },
  { value: "core", label: "Core" },
];

function ExercisesPage() {
  const treatment = useActiveTreatment();
  const [filter, setFilter] = useState<BodyRegion | "all">("all");

  if (!treatment) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Rotina de Exercícios</h1>
        <EmptyTreatmentState />
      </div>
    );
  }

  const protocol = getProtocol(treatment.protocol_id);
  const today = todaySessionInfoOf(treatment);

  const exercises = protocol.phases.flatMap((p) =>
    p.exercises.map((ex) => ({ ex, phase: p.phase_number })),
  );
  const filtered =
    filter === "all" ? exercises : exercises.filter(({ ex }) => ex.body_region === filter);

  return (
    <div className="px-5 pt-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Rotina de Exercícios</h1>
        <p className="text-sm text-muted-foreground">
          {treatment.nickname} · {protocol.name}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <ShieldCheck className="h-3 w-3" /> Vídeos validados por equipe médica
        </div>
      </header>

      <TreatmentSwitcher />

      <div className="mt-5 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {treatment.status === "active" && (
        <Link
          to="/session/$sid"
          params={{ sid: "today" }}
          className="mt-5 block rounded-2xl border-2 border-primary bg-primary-muted p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark">
                Sessão de hoje
              </p>
              <p className="mt-0.5 text-base font-bold text-foreground">{today.phase.name}</p>
              <p className="text-xs text-muted-foreground">
                {today.phase.exercises.length} exercícios
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary" />
          </div>
        </Link>
      )}

      <section className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhum exercício para esse filtro.
          </p>
        ) : (
          filtered.map(({ ex, phase }) => (
            <Link
              key={`${phase}-${ex.id}`}
              to="/session/$sid/exercise/$eid"
              params={{ sid: "today", eid: ex.id }}
              className="block transition-transform active:scale-[0.98]"
            >
              <ExerciseCard
                exercise={ex}
                status={
                  phase < treatment.current_phase
                    ? "done"
                    : phase === treatment.current_phase
                      ? "current"
                      : "next"
                }
              />
            </Link>
          ))
        )}
      </section>

      <Link
        to="/support"
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-primary"
      >
        <MessageCircle className="h-4 w-4" /> Dúvidas na execução? Fale conosco
      </Link>
    </div>
  );
}
