import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  Plus,
  RotateCcw,
  Shield,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patient";
import { TreatmentCard } from "@/components/treatment/TreatmentCard";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Perfil · FisioApp" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const user = usePatientStore((s) => s.user);
  const treatments = usePatientStore((s) => s.treatments);
  const logout = usePatientStore((s) => s.logout);
  const resetToInitial = usePatientStore((s) => s.resetToInitial);
  const resetToDemo = usePatientStore((s) => s.resetToDemo);

  const goalLabel: Record<string, string> = {
    sports: "Voltar aos esportes",
    daily_life: "Vida cotidiana sem dor",
    work: "Retornar ao trabalho",
  };

  const initial = user.name.charAt(0).toUpperCase();
  const age = Math.floor(
    (Date.now() - new Date(user.birth_date).getTime()) / (365.25 * 86400 * 1000),
  );

  const active = treatments.filter((t) => t.status !== "completed");
  const completed = treatments.filter((t) => t.status === "completed");

  return (
    <div className="px-5 pt-6 pb-4">
      <header className="flex flex-col items-center text-center">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            loading="lazy"
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {initial}
          </div>
        )}
        <h1 className="mt-3 text-xl font-bold text-foreground">{user.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {goalLabel[user.recovery_goal] ?? user.recovery_goal}
        </p>
      </header>

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Dados pessoais
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <DataCard label="Idade" value={`${age} anos`} />
          <DataCard label="Peso" value={`${user.weight_kg} kg`} />
          <DataCard label="Altura" value={`${user.height_cm} cm`} />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tratamentos
          </p>
          <Link to="/treatments" className="text-xs font-medium text-primary">
            Ver todos
          </Link>
        </div>
        <div className="mt-2 space-y-2">
          {treatments.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
              Você ainda não tem tratamentos. Inicie o primeiro abaixo.
            </p>
          )}
          {active.slice(0, 3).map((t) => (
            <TreatmentCard key={t.id} treatment={t} />
          ))}
          {completed.length > 0 && active.length < 3 && (
            <>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Concluídos
              </p>
              {completed.slice(0, 2).map((t) => (
                <TreatmentCard key={t.id} treatment={t} />
              ))}
            </>
          )}
        </div>
        <Link to="/onboarding/treatment">
          <Button variant="outline" className="mt-3 w-full rounded-xl">
            <Plus className="mr-1 h-4 w-4" /> Iniciar novo tratamento
          </Button>
        </Link>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Configurações
        </p>
        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card">
          <Row icon={<Bell className="h-4 w-4" />} label="Notificações" />
          <Row icon={<Shield className="h-4 w-4" />} label="Privacidade" />
          <Row icon={<Globe className="h-4 w-4" />} label="Idioma" value="Português" />
          <Row icon={<HelpCircle className="h-4 w-4" />} label="Suporte" />
        </div>
      </section>

      <section className="mt-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo</p>
        <Button variant="outline" className="w-full rounded-xl" onClick={resetToInitial}>
          <RotateCcw className="mr-2 h-4 w-4" /> Resetar para 0 tratamentos
        </Button>
        <Button variant="outline" className="w-full rounded-xl" onClick={resetToDemo}>
          Carregar demo (LCA + Patelofemoral)
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => {
            logout();
            navigate({ to: "/onboarding" });
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Testar criação de perfil
        </Button>
        <Button
          variant="ghost"
          className="w-full rounded-xl text-danger hover:bg-destructive/5 hover:text-danger"
          onClick={() => {
            logout();
            navigate({ to: "/welcome" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair da conta
        </Button>
      </section>
    </div>
  );
}

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-muted">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
