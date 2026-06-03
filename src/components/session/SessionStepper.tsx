import { cn } from "@/lib/utils";
import type { SessionPhase } from "@/lib/types";

const STEPS: { id: SessionPhase; label: string }[] = [
  { id: "warmup", label: "Aquecimento" },
  { id: "active", label: "Ativo" },
  { id: "peak", label: "Pico" },
  { id: "rest", label: "Descanso" },
];

export function SessionStepper({ current }: { current: SessionPhase }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const passed = i <= currentIdx;
        return (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                "h-1.5 w-full rounded-full",
                passed ? "bg-primary" : "bg-muted",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium",
                i === currentIdx ? "text-primary" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}