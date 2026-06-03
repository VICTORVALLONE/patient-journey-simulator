import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, TrendingDown, Layers, CheckCircle2, ChevronRight, User as UserIcon, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatientStore, useActiveTreatment, todaySessionInfoOf } from "@/store/patient";
import { getDynamicMessage, greeting, painReductionPct } from "@/lib/dynamicMessages";
import { TreatmentSwitcher } from "@/components/treatment/TreatmentSwitcher";
import { EmptyTreatmentState } from "@/components/treatment/EmptyTreatmentState";
import { getProtocol } from "@/data/protocols";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Início · FisioCare" }] }),
  component: HomePage,
});

function HomePage() {
  const user = usePatientStore((s) => s.user);
  const treatment = useActiveTreatment();

  if (!treatment) {
    return (
      <div className="px-5 pt-6 pb-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{greeting(user.name)} 👋</h1>
            <p className="text-sm text-muted-foreground">Você ainda não tem tratamento ativo</p>
          </div>
          <ProfileAvatarLink avatarUrl={user.avatar_url} name={user.name} />
        </header>
        <EmptyTreatmentState />
      </div>
    );
  }

  const today = todaySessionInfoOf(treatment);
  const isCompletedToday =
    treatment.sessions[0]?.scheduled_date === new Date().toISOString().slice(0, 10);
  const totalMinutes = today.phase.exercises.reduce((sum, ex) => {
    if (ex.duration_seconds) return sum + Math.round(ex.duration_seconds / 60);
    return (
      sum +
      Math.round(
        ((ex.sets ?? 3) * (ex.reps ?? 12) * 3 + (ex.rest_seconds ?? 30) * ((ex.sets ?? 3) - 1)) /
          60,
      )
    );
  }, 0);
  const protocolComplete = treatment.status === "completed";
  const protocol = getProtocol(treatment.protocol_id);
  const reduction = painReductionPct(treatment);
  const totalPhases = protocol.phases.length;
  const phasePct = Math.round((treatment.current_phase / totalPhases) * 100);

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting(user.name)} 👋</h1>
          <p className="text-sm text-muted-foreground">
            Fase {treatment.current_phase} · {today.phase.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full bg-muted p-2.5 text-muted-foreground">
            <Bell className="h-5 w-5" />
          </button>
          <ProfileAvatarLink avatarUrl={user.avatar_url} name={user.name} />
        </div>
      </header>

      <TreatmentSwitcher />

      <section className="mt-5 rounded-3xl bg-gradient-to-br from-primary-dark to-primary p-5 text-primary-foreground shadow-md">
        <p className="text-xs font-medium uppercase tracking-wider text-white/70">Sessão de hoje</p>
        <h2 className="mt-1 text-2xl font-bold leading-tight">{today.phase.name}</h2>
        <p className="mt-1 text-sm text-white/80">
          Sessão {today.sessionNumber} de {today.sessionsInPhase} ·{" "}
          {today.phase.exercises.length} exercícios · ~{totalMinutes} min
        </p>
        {protocolComplete ? (
          <div className="mt-4 rounded-xl bg-white/15 p-3 text-sm">🏆 Tratamento concluído. Parabéns!</div>
        ) : isCompletedToday ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 p-3 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" /> Sessão de hoje concluída
          </div>
        ) : (
          <Link to="/session/$sid" params={{ sid: "today" }}>
            <Button size="lg" className="mt-4 w-full rounded-xl bg-white text-primary hover:bg-white/90">
              Iniciar sessão de hoje
            </Button>
          </Link>
        )}
      </section>

      <div className="mt-5 rounded-2xl border-l-4 border-primary bg-bg-subtle p-4">
        <p className="text-sm font-medium text-foreground">{getDynamicMessage(treatment)}</p>
      </div>

      <section className="mt-5 grid grid-cols-3 gap-3">
        <StatCard
          icon={<TrendingDown className="h-4 w-4 text-success" />}
          value={reduction !== null ? `${reduction}%` : "—"}
          label="redução de dor"
        />
        <StatCard
          icon={<Layers className="h-4 w-4 text-primary" />}
          value={`${treatment.current_phase}/${totalPhases}`}
          label="fase atual"
          progress={phasePct}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
          value={`${treatment.total_sessions_completed}/${treatment.total_sessions_prescribed}`}
          label="sessões"
        />
      </section>

      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Flame className="h-3 w-3 text-warning" />
        {treatment.current_streak} dias seguidos · maior sequência {treatment.longest_streak}
      </p>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Atividade recente</h3>
          <Link to="/progress" className="flex items-center gap-1 text-xs font-medium text-primary">
            Ver tudo <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-2 space-y-2">
          {treatment.sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
              Suas sessões concluídas aparecerão aqui.
            </div>
          ) : (
            treatment.sessions.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="rounded-xl bg-success/15 p-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Sessão {s.session_number} · Fase {s.phase_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.completed_at ?? s.scheduled_date).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Dor {s.pain_level?.toFixed(1)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  progress,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center gap-1">{icon}</div>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      {typeof progress === "number" && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </div>
  );
}

function ProfileAvatarLink({ avatarUrl, name }: { avatarUrl?: string; name: string }) {
  if (avatarUrl) {
    return (
      <Link to="/profile" className="block h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary/20">
        <img
          src={avatarUrl}
          alt={name}
          loading="lazy"
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </Link>
    );
  }
  return (
    <Link to="/profile" className="rounded-full bg-primary-muted p-2.5 text-primary-dark">
      <UserIcon className="h-5 w-5" />
    </Link>
  );
}