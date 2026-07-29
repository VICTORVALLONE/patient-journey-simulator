import type { VideoRef } from "@/lib/types";

/**
 * Catálogo de vídeos clínicos, indexado pelo **número da lista dos médicos**
 * ("vídeo 22"), que é como o de-para foi validado com eles. O GUID do Bunny é
 * detalhe de hospedagem; o número é a chave clínica rastreável.
 *
 * ## Pipeline de mídia — completo (2026-07-28)
 *
 * Library "FisioApp" no Bunny Stream (`715714`), criada em 2026-07-28: embed sem
 * token, domínios abertos durante o piloto. **Os 7 vídeos do corte estão no ar.**
 *
 * O mecanismo do estado sem-vídeo continua valendo e não é herança morta: GUID
 * vazio faz `isPlayable()` devolver `false` e a superfície cai no estado
 * sem-vídeo, que é caminho de primeira classe no design. É o que sustenta o
 * Treino de Marcha, que **não terá vídeo nunca** (um vídeo genérico de marcha é
 * clinicamente errado para quem está em carga zero), e é o que fará os itens das
 * fases 2–4 aparecerem sem quebrar nada quando chegarem.
 */
export const BUNNY_LIBRARY_ID = "715714";

/**
 * GUID por número de catálogo. Vazio = ainda não subiu.
 *
 * Os 7 do corte (6 da semana 1 + boas-vindas) subiram em 2026-07-28. O nome do
 * arquivo no Bunny carrega o número (`23 - Dobrar os joelhos na parede`), que é
 * o que permite auditar o pareamento depois — o GUID não diz qual vídeo é.
 *
 * ## Divergência de rótulo vídeo × app (aberta, decisão do médico)
 *
 * Os vídeos abrem com uma **capa de título queimada na imagem**, com o nome que
 * a equipe clínica usou — que em dois casos não é o nome da cartilha:
 *
 * | Nº | Capa do vídeo | Item no app (nome da cartilha) |
 * |----|---------------|--------------------------------|
 * | 1  | "Ativação isométrica do quadriceps" | "Alongamento com o Joelho Esticado" |
 * | 3  | "Bombeamento da musculatura da panturrilha" | "Movimentos de Tornozelo" |
 *
 * **Não é vídeo trocado** — o conteúdo confere com a cartilha (o 1 mostra a
 * perna esticada com apoio no calcanhar, p. 8; o 3, o movimento de pedal). Mas
 * o paciente lê um nome na tela e outro no vídeo, e **não há correção possível
 * em código**: o texto está no pixel. As saídas são (a) o app adotar o nome do
 * vídeo, (b) a equipe reexportar as capas, ou (c) aceitar a divergência.
 * Levar ao médico junto com o piloto.
 */
const BUNNY_GUIDS: Record<number, string> = {
  1: "78ac6ca2-edc6-4e83-9504-ab1089324dde", // Alongamento com o joelho esticado
  2: "4abc272b-37bb-4b47-9c02-ab50c660ac50", // Crioterapia (gelo)
  3: "ac1e1962-9d96-4863-85ed-526103d17080", // Bombeamento de tornozelo
  22: "d35d1724-21ab-46df-8182-d0f55b765409", // Mobilização de patela
  23: "4e94174f-a70e-4356-a6a0-be733f99768d", // Dobrar os joelhos na parede
  24: "558cf632-a396-4da7-a69d-2be5371f46a2", // Dobrar os joelhos sentado na cadeira (variante do 23)
  53: "a7d9458c-896c-458d-af3e-cde97c751b9a", // Boas-vindas / orientação geral do protocolo
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
