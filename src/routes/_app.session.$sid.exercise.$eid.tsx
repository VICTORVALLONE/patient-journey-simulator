import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Bell, CheckCircle2, SkipForward, ThumbsDown, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/session/VideoPlayer";
import { SessionStepper } from "@/components/session/SessionStepper";
import { EmojiPainScale } from "@/components/session/EmojiPainScale";
import { ConfettiBurst } from "@/components/celebration/Confetti";
import { AiDoctorFab } from "@/components/support/AiDoctorSheet";
import { BADGES } from "@/data/badges";
import { usePatientStore, useActiveTreatment, todaySessionInfoOf } from "@/store/patient";
import { getProtocol } from "@/data/protocols";
import { realAdherencePct } from "@/lib/dynamicMessages";
import { cn } from "@/lib/utils";
import type { BadgeId } from "@/lib/types";

export const Route = createFileRoute("/_app/session/$sid/exercise/$eid")({
  head: () => ({ meta: [{ title: "Exercício · FisioApp" }] }),
  component: ExecutionPage,
});

type Stage =
  | { kind: "exercise" }
  | { kind: "checkin"; step: 1 | 2 | 3 }
  | {
      kind: "celebrate";
      newBadges: BadgeId[];
      phaseCompleted?: number;
      protocolCompleted: boolean;
    };

function ExecutionPage() {
  const navigate = useNavigate();
  const { eid } = useParams({ from: "/_app/session/$sid/exercise/$eid" });
  const treatment = useActiveTreatment();
  const completeSession = usePatientStore((s) => s.completeSession);
  // Hooks precisam ser incondicionais — o early return de "sem tratamento" vem depois.
  const today = treatment ? todaySessionInfoOf(treatment) : null;
  const exercises = today?.phase.exercises ?? [];
  const initialIndex = Math.max(
    0,
    exercises.findIndex((e: { id: string }) => e.id === eid),
  );
  const [index, setIndex] = useState(initialIndex);
  const [completed, setCompleted] = useState<string[]>([]);
  const [stage, setStage] = useState<Stage>({ kind: "exercise" });
  const [pain, setPain] = useState<number | null>(null);
  const [diff, setDiff] = useState<1 | 2 | 3 | null>(null);
  const [notes, setNotes] = useState("");
  const [hardFlag, setHardFlag] = useState(false);
  const [startedAt] = useState(() => Date.now());

  if (!treatment || !today) {
    return <div className="p-6 text-sm text-muted-foreground">Nenhum tratamento ativo.</div>;
  }

  const ex = exercises[index]!;
  const isLast = index >= exercises.length - 1;

  function next() {
    setCompleted((prev) => Array.from(new Set([...prev, ex.id])));
    if (!isLast) {
      setIndex((i) => i + 1);
    } else {
      setStage({ kind: "checkin", step: 1 });
    }
  }

  function skip() {
    if (!isLast) setIndex((i) => i + 1);
    else setStage({ kind: "checkin", step: 1 });
  }

  function finish() {
    const duration_minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const result = completeSession({
      pain_level: pain ?? 5,
      difficulty_rating: diff ?? 2,
      notes: notes.trim() || undefined,
      duration_minutes,
      exercises_completed: completed,
    });
    setStage({
      kind: "celebrate",
      newBadges: result.newBadges,
      phaseCompleted: result.phaseCompleted,
      protocolCompleted: result.protocolCompleted,
    });
  }

  if (stage.kind === "celebrate") {
    return (
      <CelebrationScreen
        newBadges={stage.newBadges}
        phaseCompleted={stage.phaseCompleted}
        protocolCompleted={stage.protocolCompleted}
        onContinue={() => navigate({ to: stage.protocolCompleted ? "/progress" : "/home" })}
      />
    );
  }

  if (stage.kind === "checkin") {
    return (
      <CheckInFlow
        step={stage.step}
        pain={pain}
        setPain={setPain}
        diff={diff}
        setDiff={setDiff}
        notes={notes}
        setNotes={setNotes}
        onNext={(nextStep) => {
          if (nextStep === "finish") finish();
          else setStage({ kind: "checkin", step: nextStep });
        }}
        onBack={() => {
          if (stage.step === 1) setStage({ kind: "exercise" });
          else setStage({ kind: "checkin", step: (stage.step - 1) as 1 | 2 });
        }}
      />
    );
  }

  return (
    <div className="px-5 pt-6 pb-32">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/session/$sid", params: { sid: "today" } })}
          className="rounded-full p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold text-primary-dark">
          Fase {today.phase.phase_number}: {today.phase.name}
        </span>
        <button className="rounded-full p-2 hover:bg-muted">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
      </header>

      <div className="mt-4">
        <VideoPlayer thumbnailUrl={ex.thumbnail_url} durationSeconds={ex.duration_seconds ?? 60} />
      </div>

      <div className="mt-4">
        <SessionStepper current={ex.session_phase} />
      </div>

      <h1 className="mt-5 text-2xl font-bold leading-tight text-foreground">{ex.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{ex.description}</p>

      <section className="mt-5 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Instruções principais
        </p>
        <ol className="mt-2 space-y-2">
          {ex.instructions.map((line: string, i: number) => (
            <li key={i} className="flex gap-3 text-sm text-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-bg-subtle p-3 text-sm">
        <span className="font-semibold text-foreground">
          {ex.duration_seconds
            ? `${Math.round(ex.duration_seconds / 60) || 1} min`
            : `${ex.sets ?? 3} séries × ${ex.reps ?? 12} reps`}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          Dificuldade
          {[1, 2, 3].map((d) => (
            <span
              key={d}
              className={cn(
                "h-2 w-2 rounded-full",
                d <= ex.difficulty ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </span>
      </div>

      <button
        onClick={() => setHardFlag((v) => !v)}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors",
          hardFlag
            ? "border-warning bg-warning/10 text-warning"
            : "border-border text-muted-foreground",
        )}
      >
        <ThumbsDown className="h-4 w-4" />{" "}
        {hardFlag ? "Marcado: tive dificuldade" : "Tive dificuldade"}
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Exercício {index + 1} de {exercises.length}
      </p>

      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md border-t border-border bg-card/95 p-4 backdrop-blur">
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={skip}>
            <SkipForward className="mr-1 h-4 w-4" /> Pular
          </Button>
          <Button className="flex-1 rounded-xl" size="lg" onClick={next}>
            <CheckCircle2 className="mr-1 h-5 w-5" />
            {isLast ? "Concluir e revisar" : "Concluir exercício"}
          </Button>
        </div>
      </div>

      <AiDoctorFab />
    </div>
  );
}

function CheckInFlow({
  step,
  pain,
  setPain,
  diff,
  setDiff,
  notes,
  setNotes,
  onNext,
  onBack,
}: {
  step: 1 | 2 | 3;
  pain: number | null;
  setPain: (n: number) => void;
  diff: 1 | 2 | 3 | null;
  setDiff: (n: 1 | 2 | 3) => void;
  notes: string;
  setNotes: (s: string) => void;
  onNext: (s: 2 | 3 | "finish") => void;
  onBack: () => void;
}) {
  return (
    <div className="px-5 pt-6">
      <header className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-full p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>
      </header>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-primary">
        Check-in da sessão
      </p>

      {step === 1 && (
        <>
          <h2 className="mt-2 text-2xl font-bold leading-tight">
            Como está sua articulação agora?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua resposta nos ajuda a entender sua recuperação.
          </p>
          <div className="mt-8">
            <EmojiPainScale value={pain} onChange={setPain} />
          </div>
          <Button
            size="lg"
            disabled={pain === null}
            className="mt-10 w-full rounded-xl"
            onClick={() => onNext(2)}
          >
            Próximo
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="mt-2 text-2xl font-bold leading-tight">Como foram os exercícios?</h2>
          <div className="mt-8 space-y-3">
            {(
              [
                { v: 1, label: "Muito fácil", desc: "Mal senti esforço" },
                { v: 2, label: "Na medida", desc: "Desafiador, mas no limite" },
                { v: 3, label: "Muito difícil", desc: "Senti que era demais" },
              ] as const
            ).map((opt) => {
              const active = diff === opt.v;
              return (
                <button
                  key={opt.v}
                  onClick={() => setDiff(opt.v)}
                  className={cn(
                    "w-full rounded-2xl border-2 p-4 text-left",
                    active ? "border-primary bg-primary-muted" : "border-border bg-card",
                  )}
                >
                  <p className="font-semibold text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              );
            })}
          </div>
          <Button
            size="lg"
            disabled={diff === null}
            className="mt-10 w-full rounded-xl"
            onClick={() => onNext(3)}
          >
            Próximo
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="mt-2 text-2xl font-bold leading-tight">Algo a comentar?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Opcional — pode pular se preferir.</p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: senti dor na descida do degrau…"
            className="mt-6 min-h-32 rounded-xl"
          />
          <Button size="lg" className="mt-10 w-full rounded-xl" onClick={() => onNext("finish")}>
            Concluir sessão
          </Button>
        </>
      )}
    </div>
  );
}

function CelebrationScreen({
  newBadges,
  phaseCompleted,
  protocolCompleted,
  onContinue,
}: {
  newBadges: BadgeId[];
  phaseCompleted?: number;
  protocolCompleted: boolean;
  onContinue: () => void;
}) {
  const treatment = useActiveTreatment();
  const protocol = getProtocol(treatment?.protocol_id ?? "proto_lca");
  const nextPhase = useMemo(
    () => protocol.phases.find((p) => p.phase_number === (treatment?.current_phase ?? 1)),
    [protocol, treatment?.current_phase],
  );
  const completedPhase = useMemo(
    () => protocol.phases.find((p) => p.phase_number === phaseCompleted),
    [protocol, phaseCompleted],
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-10 text-center">
      <ConfettiBurst trigger />

      {protocolCompleted ? (
        <>
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-warning/15 text-5xl">
            🏆
          </div>
          <h1 className="text-3xl font-bold text-foreground">Você chegou lá.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recuperação completa em {protocol.total_weeks} semanas.
          </p>
          <div className="mt-6 w-full rounded-2xl border border-border bg-card p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sessões</span>
              <span className="font-semibold">
                {treatment?.total_sessions_completed} / {treatment?.total_sessions_prescribed}
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Taxa de adesão</span>
              <span className="font-semibold">{treatment ? realAdherencePct(treatment) : 0}%</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Maior sequência</span>
              <span className="font-semibold">{treatment?.longest_streak} semanas na meta</span>
            </div>
          </div>
        </>
      ) : completedPhase ? (
        <>
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-muted text-5xl">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Fase {completedPhase.phase_number} concluída
          </h1>
          <p className="mt-1 text-base font-medium text-primary">{completedPhase.name}</p>
          {completedPhase.doctor_message && (
            <div className="mt-5 rounded-2xl bg-bg-subtle p-4 text-left text-sm text-foreground">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mensagem do médico
              </p>
              <p className="mt-1">{completedPhase.doctor_message}</p>
            </div>
          )}
          {nextPhase && nextPhase.phase_number !== completedPhase.phase_number && (
            <div className="mt-4 w-full rounded-2xl border border-border bg-card p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Próxima fase
              </p>
              <p className="mt-1 font-semibold">{nextPhase.name}</p>
              <p className="text-xs text-muted-foreground">{nextPhase.focus}</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-success/15 text-5xl text-success">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Sessão concluída! 🎉</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            🔥 {treatment?.current_streak ?? 0}{" "}
            {(treatment?.current_streak ?? 0) === 1 ? "semana seguida" : "semanas seguidas"} batendo
            a meta
          </p>
        </>
      )}

      {newBadges.length > 0 && (
        <div className="mt-6 w-full rounded-2xl border border-primary/30 bg-primary-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark">
            {newBadges.length === 1 ? "Nova conquista" : `${newBadges.length} novas conquistas`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {newBadges.map((id) => (
              <div
                key={id}
                className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm"
              >
                <span className="text-lg">{BADGES[id].icon}</span>
                <span className="font-semibold text-foreground">{BADGES[id].name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button size="lg" className="mt-8 w-full rounded-xl" onClick={onContinue}>
        <Trophy className="mr-2 h-5 w-5" />
        {protocolCompleted ? "Ver meu relatório" : "Ver meu progresso"}
      </Button>
    </div>
  );
}
