import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Treatment } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Treatment["status"], string> = {
  active: "Em andamento",
  completed: "Concluído",
  paused: "Pausado",
};

export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const isDone = treatment.status === "completed";
  return (
    <Link
      to="/treatments/$tid"
      params={{ tid: treatment.id }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
          isDone
            ? "bg-success/15 text-success"
            : treatment.status === "paused"
              ? "bg-muted text-muted-foreground"
              : "bg-primary-muted text-primary-dark",
        )}
      >
        {treatment.adherence_rate}%
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{treatment.nickname}</p>
        <p className="text-xs text-muted-foreground">
          {STATUS_LABEL[treatment.status]} ·{" "}
          {treatment.total_sessions_completed}/{treatment.total_sessions_prescribed} sessões
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}