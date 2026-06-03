import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, Globe, HelpCircle, LogOut, RotateCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "@/store/patient";
import { getProtocol } from "@/data/protocols";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Perfil · FisioCare" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const user = usePatientStore((s) => s.user);
  const prescription = usePatientStore((s) => s.prescription);
  const progress = usePatientStore((s) => s.progress);
  const logout = usePatientStore((s) => s.logout);
  const resetToInitial = usePatientStore((s) => s.resetToInitial);
  const resetToDemo = usePatientStore((s) => s.resetToDemo);
  const protocol = getProtocol(prescription.protocol_id);

  const goalLabel: Record<string, string> = {
    sports: "Voltar aos esportes",
    daily_life: "Vida cotidiana sem dor",
    work: "Retornar ao trabalho",
  };

  const initial = user.name.charAt(0).toUpperCase();
  const age = Math.floor((Date.now() - new Date(user.birth_date).getTime()) / (365.25 * 86400 * 1000));
  const sessionsLeft = Math.max(0, progress.total_sessions_prescribed - progress.total_sessions_completed);

  return (
    <div className="px-5 pt-6">
      <header className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
          {initial}
        </div>
        <h1 className="mt-3 text-xl font-bold text-foreground">{user.name}</h1>
        <p className="mt-1 inline-flex rounded-full bg-primary-muted px-3 py-1 text-xs font-medium text-primary-dark">
          {protocol.name} · {prescription.affected_side === "right" ? "Direito" : prescription.affected_side === "left" ? "Esquerdo" : "Bilateral"}
        </p>
      </header>

      <section className="mt-6 rounded-3xl bg-primary-navy p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Recovery journey</p>
        <p className="mt-2 text-4xl font-bold">{progress.adherence_rate}%</p>
        <p className="mt-1 text-sm text-white/80">Meta: {goalLabel[user.recovery_goal] ?? user.recovery_goal}</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress.adherence_rate}%` }} />
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Stat value={`${progress.total_sessions_completed}`} label="Sessões concluídas" />
        <Stat value={`${sessionsLeft}`} label="Sessões restantes" />
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dados pessoais</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <DataCard label="Idade" value={`${age} anos`} />
          <DataCard label="Peso" value={`${user.weight_kg} kg`} />
          <DataCard label="Altura" value={`${user.height_cm} cm`} />
        </div>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Configurações</p>
        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card">
          <Row icon={<Bell className="h-4 w-4" />} label="Notificações" />
          <Row icon={<Shield className="h-4 w-4" />} label="Privacidade" />
          <Row icon={<Globe className="h-4 w-4" />} label="Idioma" value="Português" />
          <Row icon={<HelpCircle className="h-4 w-4" />} label="Suporte" />
        </div>
      </section>

      <section className="mt-6 space-y-2 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo</p>
        <Button variant="outline" className="w-full rounded-xl" onClick={resetToInitial}>
          <RotateCcw className="mr-2 h-4 w-4" /> Resetar para 0% (demo)
        </Button>
        <Button variant="outline" className="w-full rounded-xl" onClick={resetToDemo}>
          Carregar dados do Alexandre (demo)
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
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