import { cn } from "@/lib/utils";

const SCALE = [
  { emoji: "😁", value: 0, label: "Sem dor" },
  { emoji: "😊", value: 2.5, label: "Leve" },
  { emoji: "😐", value: 5, label: "Moderada" },
  { emoji: "😣", value: 7.5, label: "Forte" },
  { emoji: "😭", value: 10, label: "Intensa" },
] as const;

export function EmojiPainScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between gap-2">
        {SCALE.map((s) => {
          const active = value === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange(s.value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-all",
                active
                  ? "scale-105 border-primary bg-primary-muted shadow-sm"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <span className="text-3xl">{s.emoji}</span>
              <span
                className={cn(
                  "text-xs",
                  active ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between px-1 text-[11px] text-muted-foreground">
        <span>Recuperando</span>
        <span>Intensa</span>
      </div>
    </div>
  );
}
