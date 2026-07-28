import { Link } from "@tanstack/react-router";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyTreatmentState() {
  return (
    <section className="mt-6 rounded-3xl border border-dashed border-border bg-card p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-muted text-primary">
        <Activity className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-foreground">Nenhum tratamento ativo</h2>
      {/* Sem "lembretes diários": este build não os envia (MVP_ASK_REMINDER em
          lib/mvpFlags.ts). Revisar junto com a volta da flag. */}
      <p className="mt-1 text-sm text-muted-foreground">
        Inicie um tratamento para receber seu plano personalizado e o acompanhamento da evolução.
      </p>
      <Link to="/onboarding/treatment">
        <Button size="lg" className="mt-5 w-full rounded-xl">
          <Plus className="mr-1 h-4 w-4" /> Iniciar tratamento
        </Button>
      </Link>
    </section>
  );
}
