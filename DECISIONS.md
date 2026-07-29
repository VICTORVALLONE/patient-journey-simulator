# DECISIONS.md — log de decisões (FisioApp)

Casa **canônica** das decisões de arquitetura, produto e processo, com o **porquê**. Append-only e datado: não reescreva o passado; adicione uma nova entrada quando algo mudar. O `CLAUDE.md` da raiz do workspace mantém só um resumo curto que aponta para cá.

Formato: `## AAAA-MM-DD — Título` · **Decisão** · **Por quê** · (opcional) **Consequência**.

---

## 2026-07-14 — Escritor único = código local; fonte da verdade = GitHub `main`

**Decisão.** Todo código é escrito localmente pelo Claude Code; o Lovable **não** edita código. GitHub `main` é a fonte da verdade.
**Por quê.** Evita o split-brain do sync bidirecional do Lovable.
**Consequência.** O Lovable escreve commits de build ao publicar → sempre `git fetch` + `git merge --ff-only origin/main` antes de todo push (detalhe operacional no `CLAUDE.md` do workspace).

## 2026-07-14 — Camadas de plataforma: Lovable = Publish + gateway; dados = Supabase próprio

**Decisão.** Lovable serve como hosting (Publish) e gateway do modelo do coach de IA na validação. O backend de dados será **Supabase PRÓPRIO** (SDK cliente/API remota, integrado localmente) — **nunca Lovable Cloud**.
**Por quê.** Lovable Cloud tem histórico de vazamentos e não oferece compliance para dado de saúde.

## 2026-07-14 — Gate LGPD antes de dado real

**Decisão.** Nenhum dado real de paciente antes de migrar para Supabase próprio + domínio próprio + chave de modelo própria.
**Por quê.** Produto de saúde regulado; sem infraestrutura própria não há como garantir compliance.
**Consequência.** Enquanto o gate não abre, tudo é mock (`src/data/`, Zustand+localStorage).

## 2026-07-14 — Plataforma: web por link → lojas via Capacitor

**Decisão.** Web app por link na validação; depois empacotar para as lojas via **Capacitor** (empacotar, não reescrever).
**Por quê.** Chega ao paciente sem fricção de loja agora; preserva o investimento em web depois.
**Consequência.** Regra de código **web-first, native-aware**: nada crítico depende só de SSR (build SPA já habilitado). Ver `CONVENTIONS.md` e `CLAUDE.md`.

## 2026-07-14 — Fonte de verdade clínica = a cartilha

**Decisão.** O protocolo LCA do app espelha o manual oficial (`../docs/cartilha-lca-limpa.txt`): semanas 1→24, metas de ADM, marcos, tríade de alerta, sinal de Lag.
**Por quê.** Credibilidade clínica exige lastro num documento validado, não em invenção do produto.

## 2026-07-14 — Foco em LCA; menisco/patelofemoral "em breve"

**Decisão.** MVP foca **recuperação de LCA**. Os protocolos de menisco e patelofemoral existem no código mas ficam marcados "em breve" no onboarding.
**Por quê.** A cartilha oficial cobre só joelho pós-LCA; profundidade clínica num protocolo vale mais que largura rasa em três. (Corrige o escopo "3 protocolos MVP" do `SPEC.md` v1.)

## 2026-07-14 — Modelo de medição de recuperação em 3 camadas

**Decisão.** Progressão travada por **semanas pós-op** (não por contagem de sessões). Métrica objetiva = **ADM real × curva-alvo** + tendência de dor. Camada 1 = dor + "atingiu meta de ADM?" (sim/não); Camada 2 (KOOS-JR) **dropada** do MVP; Camada 3 = marcos funcionais genéricos por semana.
**Por quê.** Dor sozinha não prova recuperação; a própria cartilha entrega uma métrica objetiva (ADM por semana) que serve de check leve E de gráfico principal — funcional e o mais simples possível. Marcos genéricos evitam UI de customização (muito mais barato).
**Consequência.** Base da spec 01. Detalhe e retomada em `../STATUS-medicao-recuperacao.md`.

## 2026-07-14 — Decisões de produto da spec 01 (ADM)

**Decisão.** **Q1** — a curva real de ADM é desenhada em **degraus** derivados do sim/não (a maior meta confirmada define o degrau). **Q2** — meta não atingida **só informa**; o calendário (semanas pós-op) manda na progressão de fase; segurar exercício é decisão do médico (escopo da spec 04).
**Por quê.** Mantém o check por sessão leve (binário) e não delega decisão clínica ao app.

## 2026-07-14 — Renome do produto: FisioCare → FisioApp

**Decisão.** Nome oficial é **FisioApp**. Resíduo "FisioCare" permanece apenas na chave de localStorage `fisiocare-patient-v2` (código).
**Por quê.** Padronização de marca.
**Consequência.** Rename da chave é migração de código com risco (v3→v4) — mantido em backlog, não feito junto da padronização de docs.

## 2026-07-14 — Toolchain de desenvolvimento

**Decisão.** **Adotados:** ciclo **spec-kit** (skills `/speckit-*`, CLI `specify`; pular `constitution`/`analyze` — o CLAUDE.md cumpre esse papel) e **impeccable** (guardião de UI via hook PostToolUse; `PRODUCT.md`/`DESIGN.md` são o contexto de design). **Descartados:** `superpowers` (redundante com o nativo; workflow rígido) e `ui-ux-pro-max-skill` (catálogo CSV que briga com o design system travado). **Planejados:** `supabase/agent-skills` em H1.5; skill própria de a11y em H1.4.
**Por quê.** Time enxuto / escritor único — só entra tooling que agrega sem atrito. Detalhe operacional por fase em `docs/specs/README.md`.

## 2026-07-28 — `surgery_date` obrigatória em protocolos pós-cirúrgicos

**Decisão.** `surgery_date` passa a ser **obrigatória** para LCA e menisco (`REQUIRES_SURGERY_DATE`), capturada em **tela própria** no onboarding, com eco ao vivo da semana pós-op. Patelofemoral segue sem — é conservador, e o fallback continua `started_at`.
**Por quê.** Toda a spec 01 depende dela e nada no produto produzia uma: o campo era rotulado "opcional", dividia espaço com um campo de apelido e não era lido por ninguém. Isto **reverte** a alternativa descartada em `docs/specs/01-modelo-medicao-adm/research.md` D1, que a rejeitou por "quebraria mocks e onboarding atual" — restrição que o próprio 08-A removeu.
**Consequência.** O eco é **azul, nunca vermelho**: o `DESIGN.md` reserva Vermelho Alerta para alerta clínico, e "nunca punir" vale também para entrada de dado. Data futura bloqueia; data além do fim do protocolo só avisa.

## 2026-07-28 — A jornada real é o default; o demo tem porta própria

**Decisão.** `isOnboarded` nasce `false`: visitante novo entra por `/welcome` e percorre cadastro → tratamento → boas-vindas → semana 1. O demo do Alexandre é preservado por três portas: o botão no `/welcome` (promovido a outline), a rota nova `/demo` e o `/profile`.
**Por quê.** A jornada real era inalcançável — a store já vinha semeada com o demo e `/welcome` só era acessível por dois botões escondidos no perfil.
**Consequência.** `/demo` **não é idempotente de propósito**: reabrir reinicia o demo, que é o que se quer de um link mandado a um médico. Com `isOnboarded: false`, o `/profile` deixou de ser porta de entrada — visitante novo não chega lá.

## 2026-07-28 — Boas-vindas gateiam a semana 1; o gate é concluir a tela

**Decisão.** `/boas-vindas` (rota nova, em pt-BR porque `/welcome` é o `maskPath` do prerender SPA e precisa renderizar sem estado) fica entre o cadastro e a primeira sessão. O gate é `Treatment.welcome_completed_at`, carimbado ao **concluir a tela** — não ao assistir ao vídeo.
**Por quê.** Bloquear por vídeo não visto contraria `FisioApp_Descricao_Produto.md` e o "nunca punir" do `PRODUCT.md`.
**Consequência.** **Regra de vovô** em `isWelcomePending`: tratamento sem carimbo mas com sessão concluída conta como já recebido. É o que evita jogar todo localStorage existente para `/boas-vindas` no primeiro carregamento depois do deploy — e o que permitiu a feature inteira **sem bump de versão** do persist.

## 2026-07-28 — Vídeos no Bunny Stream; o estado sem-vídeo é caminho de primeira classe

**Decisão.** Vídeos hospedados no **Bunny Stream**, via **iframe embed**. Guardamos `library_id` + GUID (`VideoRef`) e derivamos URL em `lib/video.ts`; o catálogo é indexado pelo **número da lista dos médicos** (`src/data/videos.ts`).
**Por quê.** Vídeo de exercício é conteúdo estático, não dado de paciente — não trava no gate LGPD. Não vai no **Lovable Cloud** porque ativá-lo instalaria o backend vetado. Embed em vez de `<video>`+HLS: bitrate adaptativo e Safari iOS de graça, sem `hls.js`. Ids em vez de URL: trocar embed→HLS ou pull zone não pode custar reescrever 43 literais.
**Consequência.** Enquanto os GUIDs não chegam, `isPlayable()` é `false` e tudo cai no **estado sem-vídeo**, que é silencioso e mantém as instruções escritas completas (Regra da Instrução Completa) — não é erro nem carregamento. O Treino de Marcha fica sem vídeo **para sempre**: vídeo genérico de marcha é clinicamente errado para quem está em carga zero.

## 2026-07-28 — A semana pós-op é função da data da cirurgia, não das sessões feitas

**Decisão.** Toda derivação de semana passa por `postOpWeekOf` (`lib/prescription.ts`): `postOpWeekOf → phaseForWeek → itemsForWeek`. `weekForCompletedSessions` foi **deletada** e `completeSession` passou a derivar a fase da mesma fonte que o seletor.
**Por quê.** Havia três cálculos divergentes de semana, todos inferindo a partir de sessões concluídas — o que fazia o paciente que faltou uma semana voltar no tempo. O protocolo clínico não espera ninguém. E, enquanto reducer e seletor discordavam, a tela dizia "Fase 2" e a sessão era gravada com `phase_number: 1`.
**Consequência.** O eixo do histórico de dor passa a ser a semana pós-op — o mesmo eixo do gráfico de ADM e dos marcos.

## 2026-07-28 — Semana 1 é diária; a adesão dela conta dias, não doses

**Decisão.** `clinical_guide.weeks[0].sessions_per_week = 7` para o LCA. `times_per_day` é **exibido, nunca capturado**. `totalSessionsForProtocol` passa a somar semana a semana.
**Por quê.** A cartilha prescreve os cuidados da semana 1 **3× ao dia**, não 3× na semana. E o app não tem como saber se foram 1 ou 3 aplicações de gelo — "adesão 100%" na semana 1 significa "compareceu todos os dias", nunca "fez 21 aplicações".
**Consequência.** O total do LCA vai de **86 para 90** e desloca o `adherence_rate` de todo tratamento existente: **quebra intencional da SC-005 da spec 01**, registrada aqui para não ser triada como bug daqui a duas semanas. A migração v3→v4 recalcula o total dos tratamentos **ativos**; os **concluídos ficam intactos**, porque recalcular o denominador deles desligaria o badge `protocol_complete` de quem já terminou.

## 2026-07-28 — Nem tudo que a cartilha prescreve é exercício

**Decisão.** `ItemKind` separa `exercise`, `care` (crioterapia) e `instruction` (treino de marcha). `session_phase` e `thumbnail_url` viram opcionais; `week_start`/`week_end`/`display_order` recortam e ordenam o item por semana. Variante (parede × cadeira) é **aninhada** no item, não item irmão. Nenhum id de exercício foi deletado.
**Por quê.** Tratar cuidado e orientação como "exercício" era o que empurrava a crioterapia e a marcha para fora da semana 1. Variante irmã faria os sete pontos de iteração contarem o item duas vezes ("Exercício 3 de 7" viraria 8). Deletar id deixaria dangling em `Session.exercises_completed` persistido, forçando migração transformadora sem necessidade.
**Consequência.** Onde não há arco de intensidade (a semana 1), a visão da sessão cai numa **lista plana** e a tela de execução não mostra o stepper — agrupar por aquecimento/pico ali sumiria com todo item sem `session_phase`.

## 2026-07-28 — O prerender SPA vinha produzindo um shell obsoleto em silêncio

**Decisão.** A ponte para o prerender (`aliasNitroServerEntry` em `vite.config.ts`) virou um **shim** que reexporta o entry atual do nitro por URL absoluta, em vez de uma cópia condicional.
**Por quê.** A cópia apontava para `dist/server/`, de onde o nitro já tinha saído (`.output/server/`), e ainda era guardada por `!existsSync(dest)`. Resultado: o prerender bootava um `server.js` de 14/07 deixado no disco e emitia um `_shell.html` referenciando hashes daquele build — um shell que dá 404 no próprio chunk de entrada. O build **passava**; só o artefato estava quebrado.
**Consequência.** Um `bun run build` num diretório limpo agora falha se a ponte falhar, em vez de mascarar. `dist/` e `.output/` são gerados e ignorados pelo git — limpe os dois quando desconfiar do artefato.

## 2026-07-28 — O MVP nasce vazio; o paciente-demo é destravado por `/demo`

**Decisão.** A semente da store deixa de trazer mockup: `EMPTY_USER`, zero tratamentos,
`activeTreatmentId: null` (`freshPatientData()` em `store/patient.ts`, usada também pelo
`startFreshSignup`). O paciente-demo volta só por `resetToDemo()`, que agora tem uma porta única: a
rota `/demo`. Ela **destrava o modo demo** naquele navegador (chave `fisioapp-demo-mode-v1`), e
`/demo?sair=1` trava de volta, zera o prontuário e apaga o histórico do coach.

**Por quê.** O MVP vai à mão de um médico e precisa forçar a jornada de cadastro. Não forçava: o
seed era semeado com o demo sob a justificativa de ficar "inerte enquanto `isOnboarded` for false",
e não ficava. Quem se cadastrava terminava com **4 tratamentos** (o dele mais os 3 do demo,
visíveis no seletor da home, em `/treatments` e no `/profile`) e com **o telefone, o e-mail e a
foto do Alexandre**, porque `completePersonalOnboarding` fazia spread de `MOCK_USER` e só
sobrescrevia o que o cadastro pergunta. O e-mail do demo chegava a ser impresso no PDF
"compartilhar com médico". Um F5 no meio do cadastro caía na home do demo, porque
`activeTreatmentId` apontava para um mock já com `welcome_completed_at` — a jornada só funcionava
porque a tela navegava à mão.

**Alternativas descartadas.** (a) _Duas versões do app_ — duas cópias divergem e viram dois
produtos; o padrão é um codebase com configuração por ambiente, e aqui nem isso é preciso: o
Publish manual do Lovable já separa o que se constrói do que o médico vê. (b) _`user: null`_ —
cobraria early-return em sete telas para um caso que nunca acontece, porque `entryStage` só devolve
`ready` depois de `completePersonalOnboarding` gravar um `User` completo; guardas que nunca disparam
apodrecem. O problema nunca foi "o usuário pode não existir", era "o usuário é de outra pessoa".
(c) \_Flag de build (`VITE\__`)\* — dependeria de configurar variável no painel do Lovable, e a
durabilidade de config nossa através do Publish ainda é questão aberta.

**Consequências.**

- **Sem bump de versão do persist.** A forma persistida não muda; muda a fábrica de estado
  inicial, que o zustand só usa quando não há nada em localStorage. Quem já usava o app **não vê
  diferença ao atualizar** — a jornada limpa se vê por `/demo?sair=1` ou aba anônima. Um v5 com
  `migrate` no-op seria mentira no log.
- `phone` e `email` viram **opcionais** em `User`: o cadastro nunca os pediu, eram obrigatórios só
  porque o único usuário que existia era o mock. O compilador passou a acusar o único consumidor
  real, o PDF.
- **Terceira chave de localStorage.** Ao lado do prontuário (`fisiocare-patient-v2`) e do histórico
  do coach (`fisiocare-aidoctor-v1`). O modo demo mora fora da store porque é propriedade do
  navegador do operador, não do prontuário — quando o dado migrar para o Supabase próprio, um campo
  desses lá dentro viraria exceção de migração.
- **O histórico do coach passou a ser limpo junto.** Ele mora fora da store e nenhum reset o
  alcançava: a conversa do demo atravessava para quem se cadastrasse depois, e a de um paciente
  atravessava de volta para quem abrisse a demo.
- **`beforeLoad` lê o modo demo de forma síncrona; componente lê só por efeito** (`useDemoMode`).
  `/welcome` é o `maskPath` do prerender SPA: ler estado do cliente durante o render daria mismatch
  de hidratação na primeira tela do app.
- **"Sair da conta" saiu do alcance do paciente** junto com a seção Demo. Efeito colateral
  bem-vindo: sem login, aquele botão apaga tratamentos sem confirmação e sem volta.
- **A primeira impressão do médico fica vazia** — gráfico de dor sem pontos, 0/90 sessões, adesão
  0%. É a tela real de quem acabou de entrar. A mitigação é mostrar a jornada limpa pelo link e
  depois abrir `/demo` para exibir um paciente adiantado.

## 2026-07-28 — Corte de testes do piloto: sem data de cirurgia e sem lembrete no onboarding

**Decisão.** Para a rodada de validação com o cliente, o onboarding do tratamento perde dois
elementos: a **tela da data da cirurgia** e o **campo de horário do lembrete**. Passa de 4 para 3
passos (diagnóstico → lado afetado → quem prescreveu). Todo paciente novo começa na **semana 1**.
As duas features ficam **desligadas, não removidas**: `src/lib/mvpFlags.ts` (`MVP_ASK_SURGERY_DATE`,
`MVP_ASK_REMINDER`) governa cada uma, e o código que elas escondem continua no repo. **Ambas voltam
na versão final, depois dos ajustes do MVP com o cliente.**

**Por quê.** Motivos distintos por feature:

- **Data da cirurgia:** a tela funciona, mas ela deixa o paciente entrar em qualquer semana do
  protocolo — quem informasse uma cirurgia de cinco semanas atrás cairia na semana 5, cujo conteúdo
  clínico **não foi revisado com o médico** e cujos vídeos não existem. O único conteúdo validado
  contra a cartilha neste corte é a semana 1. Travar o ponto de partida é travar o teste no que se
  pode defender.
- **Lembrete:** o campo coletava preferência para algo que o app não faz — não há push, cron nem
  service worker. A própria tela admitia ("no MVP, lembretes ainda não são enviados"). Gastava um
  passo do onboarding e criava expectativa que o piloto não cumpre.

**Como a semana 1 fica garantida sem a tela.** `postOpWeekOf` ancora em `surgery_date ||
started_at`. Sem data, a âncora é o `started_at`, gravado como hoje no `makeTreatment` — dia 0,
semana 1. **Não se grava dado falso:** `surgery_date` fica `undefined`, não "hoje". Inventar data de
cirurgia para satisfazer o cálculo poluiria o prontuário com informação clínica que ninguém
informou. A progressão continua real: no oitavo dia o piloto avança para a semana 2 pelo mesmo
cálculo de sempre — o que se travou é o **ponto de partida**, não o relógio.

**Alternativas descartadas.** (a) _Branch separada para o piloto_ — divergiria da `main` enquanto o
piloto roda (o Lovable escreve commits de build a cada Publish) e o merge de volta chegaria
conflitado; é a mesma lógica que descartou "duas versões do app" nesta mesma data. (b) _Deletar as
telas e reescrever depois_ — a validação da data (`surgeryDateValidity`), o eco ao vivo da semana e
os testes deles são trabalho pronto; jogar fora para refazer é a forma mais cara de esperar.
(c) _Congelar a semana em 1 permanentemente_ (ignorar o relógio) — o paciente-piloto ficaria preso
na semana 1 para sempre, o que quebra o próprio objeto do teste: ver a progressão acontecer.

**Consequências.**

- **A cópia teve de acompanhar.** Três lugares prometiam lembretes e foram ajustados: a promessa do
  `/welcome`, o texto do `EmptyTreatmentState` e a pergunta do FAQ em `/support` — esta última
  mandava o paciente a "Configurações > Notificações", que não existe. Revisar todas as três quando
  a flag voltar.
- **A barra de progresso passou a ser derivada**, não numerada à mão: `STEPS` em
  `onboarding.treatment.tsx` é a lista de passos ativos, e o botão Voltar, a barra e o passo final
  leem dela. Religar a flag reencadeia a navegação sozinho.
- **`reminder_time` continua no tipo `Treatment`, no draft e no `makeTreatment`** — o dado nunca
  perdeu casa, só deixou de ser preenchido. Retomada de verdade (envio) depende de Capacitor + push.
- **O código das telas desligadas ainda vai no bundle** (o `StepSurgeryDate` continua referenciado,
  logo não é removido por tree-shaking). É o custo aceito de estacionar em vez de deletar: alguns KB
  contra a garantia de que a volta é uma troca de `false` por `true`.
- As flags são anotadas como `boolean`, não como literal: sem isso o TypeScript apaga o ramo
  desligado na checagem de tipo e a volta da flag viraria erro de compilação.

## 2026-07-28 — Streak em duas camadas: dias como base, semanas só a partir da semana 3

**Decisão.** O streak deixa de ser uma métrica única de semanas e vira duas camadas
(`lib/streak.ts`): **dias seguidos** de sessão concluída (`computeDayStreak`), visível desde o
primeiro dia e com marcos próprios (badges **10 Dias Seguidos** e **20 Dias Completos**); e
**semanas na meta** (`computeWeeklyStreak`), que **só passa a contar a partir da semana pós-op 3**
(`WEEKLY_STREAK_START_WEEK`). A home mostra dias sempre e acrescenta semanas quando elas existem;
a celebração e a mensagem dinâmica falam em dias; o PDF traz os dois.

**Por quê.** O streak semanal lia a meta do protocolo (3/semana) enquanto a semana 1 é diária: o
paciente acendia "1 semana na meta" com 3 dias de 7 — 43% de adesão premiada na tela feita para
mostrar rigor. Subir a meta para 7 punia quem fizesse 6 de 7 ("nunca punir", PRODUCT.md). O erro
era de categoria: **uma semana não é uma sequência** — "semanas consecutivas" não significa nada
na primeira semana de alguém. Na semana 1 a métrica honesta já existia (adesão em dias); o que
faltava era a camada de engajamento diário, que agora é o streak de dias.

**Regra do multi-dose, casada com a adesão.** Itens 3× ao dia (gelo, alongamento, tornozelo) NÃO
multiplicam o streak: o dia conta **uma vez** — dias, não doses. Vale por construção: o reducer
grava no máximo 1 sessão/dia e `times_per_day` é instrução exibida, nunca capturada (mesma decisão
da adesão da semana 1).

**Duas correções de honestidade que vieram junto:**

- **Âncora**: as semanas do streak agora são as pós-operatórias (`surgery_date || started_at`, a
  mesma âncora de `postOpWeekOf`) — antes eram semanas corridas desde o início do uso, e o streak
  podia discordar da tela sobre que semana é.
- **Meta por semana**: `sessionsPerWeekForWeek` (guia clínico manda, fase é padrão) — antes era o
  `sessions_per_week` do protocolo (3), que subestimava as fases 2–3 (pedem 4) e deixava o streak
  acender com menos sessões do que a fase prescreve.
- **Exibição ao vivo**: a home recalcula os streaks das sessões em vez de ler o campo persistido,
  que congela no valor da última sessão e mentiria para quem parou. Os campos persistidos
  (`current_day_streak`/`longest_day_streak`, opcionais, sem migração) existem para os badges e
  para a celebração, que dispara logo após o recálculo.

**Alternativas descartadas.** (a) _Meta 7 na semana 1_ — pune 6/7. (b) _Deixar a meta 3_ — premia
43%. (c) _Streak de dias ininterrupto o protocolo inteiro_ — nas fases de 3–4×/semana o descanso
prescrito quebraria a sequência; por isso o streak de dias tolera o dia corrente pendente e a
camada de longo prazo é a semanal, que respeita a cadência da fase.

## 2026-07-28 — Lote de ajustes da validação do operador (jornada + superfícies)

**Contexto.** Primeira rodada de validação do operador no build local. Seis ajustes:

1. **Boas-vindas ganham "Ir para a home"** ao lado de "Começar minha primeira sessão". Os dois
   concluem o gate (que é de conclusão da TELA): prender quem escolheu conhecer o app num loop de
   boas-vindas puniria a escolha.
2. **"Tive dificuldade" era cosmético e vazava**: o estado não resetava ao trocar de exercício
   (marcou no 2º, o 3º nascia marcado) e o toque não gravava nada. Agora reseta por item e os ids
   marcados vão na sessão (`exercises_with_difficulty`, opcional — sem migração). Vale também para
   item pulado: quem marcou dificuldade e pulou reportou dificuldade.
3. **Check-in**: "Como está sua articulação agora?" → **"Como foi o seu nível de dor geral?"**
   (pedido do operador; a escala continua a mesma, 0–10 em 5 emojis).
4. **Configurações do /profile só com o que funciona**: Notificações, Privacidade e Idioma eram
   botões sem onClick — quatro toques mortos na seção que o médico mais vai fuçar. Ficou só
   Suporte, agora de fato navegando para /support. Cada linha volta com a sua feature
   (lembretes → `MVP_ASK_REMINDER`; Privacidade → gate LGPD; Idioma → segundo idioma).
5. **Fotos de banco de imagem removidas dos cards de exercício**: as thumbs genéricas por região
   não mostravam o exercício prescrito (e podiam ensinar errado). O card mostra o placeholder
   "Imagem a incluir" até chegarem as imagens reais (`thumbnail_url` volta a ser honrado quando
   preenchido) — mesmo princípio do estado sem-vídeo. FAQ do suporte também perdeu a resposta que
   apontava para "Configurações > Notificações" (tela que não existe).
6. **Auditoria da aba Exercícios contra a cartilha**: os 29 itens do protocolo LCA existem todos
   no manual (semana 1 espelha a página 8 item a item; fases 2–4 batem com as páginas 11–26,
   com séries/cargas por vezes compactadas — ex.: a cartilha progride o Apoio Unipodal 2→3→4 kg
   e o app fixa "2 a 3 kg"). Nenhum exercício inventado. A cartilha tem itens que o app ainda NÃO
   cobre (Elevação da Perna Para Trás, Fortalecimento de Panturrilha com resistência, Sentar e
   Levantar, Dobrar os Joelhos em pé, Prancha Lateral, Andar de Lado, Ponta dos Pés com Degrau,
   Ponte com Elevação/Superfície, Salto com Obstáculo, Isometria 90°–45°) — lacuna de cobertura
   das fases 2–4, fora do corte da semana 1, registrada para a revisão clínica com o médico.

## 2026-07-28 — Semana 1 continua com sessão única diária; doses viram checklist na versão final

**Decisão (operador, 2026-07-28).** A proposta de quebrar o dia da semana 1 em 3 sessões (uma
completa + duas só com os itens 3× ao dia) **não entra no piloto**. O formato travado para a
versão final é o caminho do meio: **1 sessão guiada por dia** (como hoje) + **checklist de doses
leve e não-punitivo** dentro do dia ("gelo: 2ª dose ✓ · 3ª dose ✓"), que alimenta o relatório do
médico mas **não entra em adesão nem streak**. Pré-requisito honesto: **lembretes** (push via
Capacitor) — checklist de dose sem lembrete às 15h/21h só documenta esquecimento. Entra junto da
volta de `MVP_ASK_REMINDER`, na fase da spec 02 (execução de sessão) com dependência da spec 07.

**Por que não as 3 sessões.** (a) Carga de registro ~3h15/dia para um operado de 3 dias, sem
lembrete nenhum neste build; (b) dose esquecida derrubaria "2/3 do dia" — punição do comportamento
mais frequente, contra o "nunca punir" e contra a decisão "adesão conta dias, não doses";
(c) o modelo inteiro assume 1 sessão/dia (guarda do reducer, total 90, streak de dias, migração
v4) — mudar isso na semana em que o app vai ao médico é risco sem retorno no piloto. O formato
define o que "adesão" significa no relatório: levar a decisão final ao médico junto com o piloto.

## 2026-07-28 — Cobertura das fases 2–4: 10 exercícios da cartilha a trazer para o app

**Registro para a fase seguinte (operador, 2026-07-28).** A auditoria da aba Exercícios contra a
cartilha (mesma data, acima) confirmou 29/29 itens do app presentes no manual — e, no sentido
inverso, itens do manual que o app ainda não cobre, todos de fases 2–4 (fora do corte da semana 1):

1. Elevação da Perna Para Trás (2ª semana em diante; com carga a partir da 12ª)
2. Fortalecimento de Panturrilha com resistência (2ª–3ª semana; faixa/toalha/bola)
3. Apoio Unipodal simples (2ª–4ª semana — o app só tem a variante "dupla função" com peso)
4. Treino de Sentar e Levantar (5ª–7ª) e a progressão Unipodal (8ª–9ª)
5. Dobrar os Joelhos em pé (5ª–7ª; nota da cartilha: 90°–45° só p/ tendão patelar)
6. Isometria de Quadríceps 90°–45° (8ª–9ª, progressão da isometria a 90°)
7. Prancha Lateral (10ª–11ª)
8. Andar Para o Lado (10ª–12ª)
9. Ponta dos Pés com Degrau (10ª em diante; com mochila 3→4→5 kg)
10. Ponte com Elevação de Perna / com Superfície (12ª em diante) e Salto com Obstáculo (13ª–16ª)

Além dos itens ausentes, séries/cargas de alguns exercícios existentes estão compactadas vs. a
progressão semanal da cartilha (ex.: Apoio Unipodal 2→3→4 kg; Ponte 5×15s → 3×20s → 3×30s).
**Destino:** revisão clínica com o médico na fase seguinte (roadmap em `docs/specs/README.md`),
usando `week_start`/`week_end`/`display_order` — o mecanismo que a semana 1 já usa.

## 2026-07-28 — Vídeos da semana 1 no ar; capa do vídeo divergindo do nome do app

**Estado.** Os **6 vídeos da semana 1** subiram para a library Bunny `715714` e estão ligados em
`src/data/videos.ts` (nºs 1, 2, 3, 22, 23, 24). Verificado no build de produção: cada vídeo aparece
**no item certo**, a variante "Sentado na cadeira" troca para o **24**, e todos **tocam de verdade**
(mídia carregada e tempo avançando — 21/21 critérios de navegador). O **53** (boas-vindas, 584 MB)
segue pendente e as boas-vindas continuam no estado sem-vídeo, como projetado.

**Achado a resolver com o médico — não tem correção em código.** Os vídeos abrem com uma **capa de
título queimada na imagem**, com o nome que a equipe clínica deu ao exercício. Em dois casos esse
nome não é o da cartilha, que é o que o app exibe:

| Nº  | Capa do vídeo                               | Item no app (nome da cartilha)      |
| --- | ------------------------------------------- | ----------------------------------- |
| 1   | "Ativação isométrica do quadriceps"         | "Alongamento com o Joelho Esticado" |
| 3   | "Bombeamento da musculatura da panturrilha" | "Movimentos de Tornozelo"           |

**Não é vídeo trocado:** o conteúdo confere com a cartilha (o 1 mostra a perna esticada com apoio no
calcanhar e peso na coxa, p. 8; o 3 é o movimento de pedal). Mas o paciente lê um nome no título da
tela e outro dentro do vídeo — e o texto está no pixel, não em legenda. Saídas: (a) o app adota o
nome do vídeo; (b) a equipe reexporta as capas com o nome da cartilha; (c) aceita-se a divergência.
**Recomendação: (b)** — a cartilha é a fonte de verdade clínica travada (decisão de 2026-07-14) e
mudar o nome no app desalinharia o app do manual que o paciente tem em mãos.

**Nota de verificação (para não reaprender).** O embed é montado com `preload=false` para não gastar
dado do paciente, então antes do play o `<video>` fica em `readyState 0` — **isso não é falha**.
Verificação de vídeo tem de dar `play()` (com `muted=true`, senão a política de autoplay rejeita) e
checar que `currentTime` avança; só checar `readyState` produz falso negativo nos 6.
