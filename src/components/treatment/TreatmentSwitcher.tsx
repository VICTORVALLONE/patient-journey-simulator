import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { usePatientStore } from "@/store/patient";
import { cn } from "@/lib/utils";

export function TreatmentSwitcher() {
  const treatments = usePatientStore((s) => s.treatments);
  const activeId = usePatientStore((s) => s.activeTreatmentId);
  const setActive = usePatientStore((s) => s.setActiveTreatment);

  const active = treatments.filter((t) => t.status === "active");
  if (active.length === 0) return null;

  return (
    <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
      {active.map((t) => {
        const isActive = t.id === activeId;
        return (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {t.nickname}
          </button>
        );
      })}
      <Link
        to="/onboarding/treatment"
        className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border bg-card px-3 py-1.5 text-xs font-medium text-primary"
      >
        <Plus className="h-3 w-3" /> Novo
      </Link>
    </div>
  );
}