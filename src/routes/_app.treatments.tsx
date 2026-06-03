import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patient";
import { TreatmentCard } from "@/components/treatment/TreatmentCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/treatments")({
  head: () => ({ meta: [{ title: "Meus tratamentos · FisioCare" }] }),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const navigate = useNavigate();
  const treatments = usePatientStore((s) => s.treatments);
  const [tab, setTab] = useState<"active" | "completed">("active");

  const list = treatments.filter((t) =>
    tab === "active" ? t.status !== "completed" : t.status === "completed",
  );

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="flex items-center gap-2">
        <button onClick={() => navigate({ to: "/profile" })} className="rounded-full p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Meus tratamentos</h1>
      </header>

      <div className="mt-4 inline-flex rounded-full bg-muted p-1">
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {t === "active" ? "Ativos" : "Concluídos"}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            {tab === "active"
              ? "Nenhum tratamento ativo. Inicie um agora."
              : "Você ainda não concluiu nenhum tratamento."}
          </p>
        ) : (
          list.map((t) => <TreatmentCard key={t.id} treatment={t} />)
        )}
      </div>

      <Link to="/onboarding/treatment">
        <Button className="mt-5 w-full rounded-xl">
          <Plus className="mr-1 h-4 w-4" /> Iniciar novo tratamento
        </Button>
      </Link>
    </div>
  );
}