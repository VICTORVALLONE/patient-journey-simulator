import type { VideoRef } from "@/lib/types";

/**
 * Derivação de URL do Bunny Stream. Um único lugar sabe montar URL — ver o
 * porquê em `VideoRef`.
 *
 * Usamos o **iframe embed**, não `<video>` + HLS: o embed entrega bitrate
 * adaptativo e Safari iOS de graça, enquanto HLS nativo exigiria `hls.js` no
 * Chrome e no Firefox (dependência nova num app que roda em WebView via
 * Capacitor).
 */
const EMBED_BASE = "https://iframe.mediadelivery.net/embed";

export interface EmbedOptions {
  autoplay?: boolean;
  /** Legendas ligadas por padrão. Desligado por ora — não há faixa de legenda. */
  captions?: boolean;
}

export function embedUrlFor(video: VideoRef, opts: EmbedOptions = {}): string {
  const params = new URLSearchParams({
    autoplay: opts.autoplay ? "true" : "false",
    preload: "false",
    responsive: "true",
  });
  return `${EMBED_BASE}/${video.library_id}/${video.video_id}?${params.toString()}`;
}

/**
 * Um `VideoRef` só é reproduzível quando tem library e GUID reais. Enquanto o
 * catálogo estiver em stub (`src/data/videos.ts`), isto é `false` para todos —
 * e o estado sem-vídeo é caminho de primeira classe no design, não erro.
 */
export function isPlayable(video: VideoRef | undefined | null): video is VideoRef {
  return !!video && !!video.library_id && !!video.video_id;
}
