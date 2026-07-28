/**
 * Estacionamento do MVP Piloto — o que sai da jornada só nesta rodada de testes.
 *
 * Regra deste arquivo: **nada é deletado, só desligado.** Cada flag aqui é uma
 * feature construída, testada e temporariamente fora da vista do médico e do
 * paciente-piloto. O código que ela governa continua no repo, referenciado por
 * um `{FLAG && ...}` — é isso que faz a volta ser a troca de `false` por `true`,
 * e não uma reimplementação.
 *
 * Por que flag e não branch: a branch divergiria da `main` enquanto o piloto
 * roda (o Lovable escreve commits de build no `main` a cada Publish) e o merge
 * de volta chegaria conflitado. É a mesma lógica que descartou "duas versões do
 * app" em 2026-07-28 — ver `DECISIONS.md`.
 *
 * Ao ligar qualquer flag de volta: rodar `bun run test` (há testes que fixam o
 * comportamento das duas rodadas) e reler a decisão correspondente no
 * `DECISIONS.md` antes de mexer na tela.
 */

/**
 * Pergunta a data da cirurgia numa tela própria do onboarding do tratamento.
 *
 * **Desligada em 2026-07-28** para a rodada de testes com o cliente: o piloto
 * começa todo mundo na **semana 1**, que é o único conteúdo clínico validado
 * contra a cartilha neste corte de release. Com a tela ligada, quem informasse
 * uma cirurgia de cinco semanas atrás cairia direto na semana 5 — semana cujo
 * conteúdo ainda não foi revisado com o médico, e cujos vídeos não existem.
 *
 * **Como a semana 1 fica garantida sem a tela:** `postOpWeekOf` ancora em
 * `surgery_date || started_at` (`lib/prescription.ts`). Sem data, a âncora é o
 * `started_at`, gravado como hoje no `makeTreatment` — logo, dia 0, semana 1.
 * Não há dado falso: `surgery_date` fica `undefined`, não "hoje".
 *
 * **Progressão continua real:** no oitavo dia o paciente-piloto avança para a
 * semana 2 pelo mesmo cálculo de sempre. O que se travou é o *ponto de partida*,
 * não o relógio.
 *
 * **Ao religar:** a tela (`StepSurgeryDate`), a validação (`surgeryDateValidity`,
 * com testes em `tests/unit/entry.test.ts`) e o eco ao vivo da semana estão
 * inteiros. Ligar aqui reintroduz o passo e volta a obrigatoriedade regida por
 * `REQUIRES_SURGERY_DATE` (`data/protocols.ts`).
 *
 * Anotada como `boolean` de propósito: sem isso o TypeScript estreita para o
 * literal `false`, apaga o ramo desligado na checagem de tipo e transforma a
 * volta da flag num erro de compilação em vez de uma troca de valor.
 */
export const MVP_ASK_SURGERY_DATE: boolean = false;

/**
 * Pergunta o horário do lembrete de sessão no onboarding do tratamento.
 *
 * **Desligada em 2026-07-28.** O campo coletava uma preferência que o app não
 * honra: não há push, cron nem service worker — a própria tela admitia isso
 * numa nota ("no MVP, lembretes ainda não são enviados"). Pedir configuração de
 * algo que não acontece gasta um passo do onboarding e cria expectativa que o
 * piloto não cumpre.
 *
 * **Ao religar:** `reminder_time` segue no tipo `Treatment`, no
 * `TreatmentOnboardingDraft` e no `makeTreatment` — o dado nunca deixou de ter
 * casa. Religar só volta a preenchê-lo. Retomada de verdade (envio) depende de
 * Capacitor + push, fora do corte deste release.
 */
export const MVP_ASK_REMINDER: boolean = false;
