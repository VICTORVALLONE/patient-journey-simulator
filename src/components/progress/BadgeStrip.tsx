import { BADGES, ALL_BADGE_IDS } from "@/data/badges";
import { cn } from "@/lib/utils";
import type { BadgeId } from "@/lib/types";

export function BadgeStrip({ unlocked }: { unlocked: BadgeId[] }) {
  const set = new Set(unlocked);
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {ALL_BADGE_IDS.map((id) => {
        const b = BADGES[id];
        const isUnlocked = set.has(id);
        return (
          <div
            key={id}
            className={cn(
              "flex w-20 shrink-0 flex-col items-center gap-1 rounded-2xl border p-2 text-center",
              isUnlocked ? "border-primary/30 bg-primary-muted" : "border-border opacity-40",
            )}
          >
            <span className="text-2xl">{b.icon}</span>
            <span className="text-[10px] font-medium leading-tight">{b.name}</span>
          </div>
        );
      })}
    </div>
  );
}
