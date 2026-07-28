import type { VideoRef } from "@/lib/types";

/**
 * Catálogo de vídeos clínicos, indexado pelo **número da lista dos médicos**
 * ("vídeo 22"), que é como o de-para foi validado com eles. O GUID do Bunny é
 * detalhe de hospedagem; o número é a chave clínica rastreável.
 *
 * ## STUB — aguardando o pipeline de mídia
 *
 * `BUNNY_LIBRARY_ID` e os GUIDs ainda não existem: os arquivos estão no Google
 * Drive e a library do Bunny ainda não foi criada. Enquanto as strings estiverem
 * vazias, `isPlayable()` devolve `false` e toda superfície cai no **estado
 * sem-vídeo**, que é caminho de primeira classe no design (hoje é o estado dos
 * 43 exercícios). Nada quebra quando os valores chegarem: preencher aqui é a
 * única edição necessária.
 *
 * Para preencher: `library_id` fica no painel do Bunny (Stream → sua library);
 * o GUID de cada vídeo, na página do vídeo.
 */
export const BUNNY_LIBRARY_ID = "";

/** GUID por número de catálogo. Vazio = ainda não subiu. */
const BUNNY_GUIDS: Record<number, string> = {
  1: "", // Alongamento com o joelho esticado
  2: "", // Crioterapia (gelo)
  3: "", // Bombeamento de tornozelo
  22: "", // Mobilização de patela
  23: "", // Dobrar os joelhos na parede
  24: "", // Dobrar os joelhos sentado na cadeira (variante do 23)
  53: "", // Boas-vindas / orientação geral do protocolo
};

/** Rótulo humano de cada número — usado no estado sem-vídeo e em diagnóstico. */
export const VIDEO_LABELS: Record<number, string> = {
  1: "Alongamento com o joelho esticado",
  2: "Crioterapia (gelo)",
  3: "Bombeamento de tornozelo",
  22: "Mobilização de patela",
  23: "Dobrar os joelhos na parede",
  24: "Dobrar os joelhos sentado na cadeira",
  53: "Boas-vindas: seu protocolo de recuperação",
};

/**
 * Devolve sempre um `VideoRef` — nunca `undefined` — para que a ausência de
 * vídeo seja um *estado* renderizável e não um galho de `if` em cada tela.
 * Use `isPlayable()` de `lib/video.ts` para decidir player vs. estado sem-vídeo.
 */
export function videoByCatalogNumber(n: number): VideoRef {
  return {
    provider: "bunny",
    library_id: BUNNY_LIBRARY_ID,
    video_id: BUNNY_GUIDS[n] ?? "",
    catalog_number: n,
  };
}

/** Vídeo da tela de boas-vindas (nº 53 na lista dos médicos). */
export const WELCOME_VIDEO = videoByCatalogNumber(53);
