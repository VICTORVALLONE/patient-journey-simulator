import { Film } from "lucide-react";

import { VIDEO_LABELS } from "@/data/videos";
import type { VideoRef } from "@/lib/types";
import { embedUrlFor, isPlayable } from "@/lib/video";
import { cn } from "@/lib/utils";

interface BunnyVideoProps {
  video?: VideoRef | null;
  /** Título acessível do iframe e rótulo do estado sem-vídeo. */
  title: string;
  className?: string;
}

/**
 * Player de vídeo do Bunny Stream — e, com a mesma dignidade, o **estado
 * sem-vídeo**.
 *
 * O estado sem-vídeo não é erro nem placeholder de carregamento: é o estado
 * correto de todo item cuja mídia ainda não subiu, e do Treino de Marcha, que
 * não terá vídeo nunca (um vídeo genérico de marcha é clinicamente errado para
 * quem está em carga zero). Por isso ele é silencioso: sem ícone de alerta, sem
 * spinner, sem cor de erro. As instruções escritas ao lado seguem completas —
 * é a Regra da Instrução Completa.
 */
export function BunnyVideo({ video, title, className }: BunnyVideoProps) {
  const label = video?.catalog_number ? (VIDEO_LABELS[video.catalog_number] ?? title) : title;

  if (!isPlayable(video)) {
    return (
      <div
        className={cn(
          "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl bg-bg-subtle",
          className,
        )}
      >
        <Film className="h-7 w-7 text-muted-foreground/60" />
        <p className="px-6 text-center text-xs text-muted-foreground">
          {label}
          <span className="mt-0.5 block text-[11px] text-muted-foreground/75">
            Vídeo em preparação — siga as instruções abaixo.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("aspect-video w-full overflow-hidden rounded-2xl bg-primary-navy", className)}
    >
      <iframe
        src={embedUrlFor(video)}
        title={label}
        loading="lazy"
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}
