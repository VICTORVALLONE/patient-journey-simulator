import { Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Placeholder de player. Sem vídeo real (Bunny.net) por enquanto: exibe o
 * thumbnail e simula um play/pause com contador de tempo, o que valida o
 * fluxo de UI sem depender de assets externos.
 */
export function VideoPlayer({
  thumbnailUrl,
  durationSeconds = 60,
}: {
  thumbnailUrl: string;
  videoUrl?: string;
  durationSeconds?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    ref.current = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= durationSeconds) {
          setPlaying(false);
          return durationSeconds;
        }
        return e + 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [playing, durationSeconds]);

  const pct = Math.min(100, (elapsed / durationSeconds) * 100);
  const fmt = (n: number) =>
    `${Math.floor(n / 60)
      .toString()
      .padStart(1, "0")}:${(n % 60).toString().padStart(2, "0")}`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-primary-navy">
      <img src={thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={playing ? "Pausar" : "Reproduzir"}
      >
        <span
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform",
            playing && "scale-90 opacity-0",
          )}
        >
          <Play className="h-7 w-7 fill-current" />
        </span>
        {playing && (
          <span className="rounded-full bg-white/90 p-3 text-primary">
            <Pause className="h-6 w-6 fill-current" />
          </span>
        )}
      </button>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] font-medium text-white/90">
          <span>{fmt(elapsed)}</span>
          <span>{fmt(durationSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
