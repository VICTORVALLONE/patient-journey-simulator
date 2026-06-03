import { Lock } from "lucide-react";
import { BADGES, ALL_BADGE_IDS } from "@/data/badges";
import { cn } from "@/lib/utils";
import type { BadgeId } from "@/lib/types";

export function BadgeGrid({ unlocked }: { unlocked: BadgeId[] }) {
  const set = new Set(unlocked);
  return (
    <div className="grid grid-cols-3 gap-3">
      {ALL_BADGE_IDS.map((id) => {
        const b = BADGES[id];
        const isUnlocked = set.has(id);
        return (
          <div
            key={id}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center",
              isUnlocked
                ? "border-primary/30 bg-primary-muted"
                : "border-border bg-card opacity-60",
            )}
          >
            <span className="text-2xl">{isUnlocked ? b.icon : <Lock className="h-5 w-5 text-muted-foreground" />}</span>
            <span className="text-[11px] font-semibold leading-tight text-foreground">{b.name}</span>
          </div>
        );
      })}
    </div>
  );
}