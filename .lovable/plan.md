# Plano de melhorias do MVP

## 1. Foto de perfil de teste
- Adicionar `avatar_url?: string` em `User` (`src/lib/types.ts`).
- Gerar uma foto retrato realista (Alexandre, ~35a, ambiente claro) via imagegen e referenciar em `MOCK_USER.avatar_url` (`src/data/mockUser.ts`).
- Em `_app.profile.tsx`: trocar o círculo com inicial por `<img>` quando houver `avatar_url`, com fallback para a inicial.
- Mostrar a mesma foto também no header do Home (avatar pequeno) para consistência.

## 2. Histórico do tratamento concluído (Patelofemoral)
Hoje `MOCK_TREATMENT_PATELLO_DONE.sessions = []`. Vamos popular dados realistas para que o detalhe do tratamento mostre histórico real:
- Gerar 36 `Session`s (12 semanas × 3/semana) com `completed_at` distribuído entre `2023-06-01` e `2023-09-30`, `pain_level` decrescente (6 → 0), `difficulty_rating` variável, `duration_minutes` ~22–35, `exercises_completed` preenchido com os ids do protocolo de cada fase, e algumas `notes` curtas.
- Expandir a tela `_app.treatments.$tid.tsx` para o caso `completed`:
  - Mostrar gráfico de evolução da dor (reutilizar `PainTrendChart`).
  - Mostrar frequência semanal (`WeeklyFrequencyChart`).
  - Lista enxuta das últimas 8 sessões com data, duração, dor e dificuldade.
  - Tempo total de tratamento (semanas) e redução de dor (de X → Y).

## 3. Imagens de referência nos vídeos
- Substituir os SVG `T1/T2/T3` por thumbnails reais por região corporal: joelho, quadril, tornozelo, core (4 imagens geradas com imagegen — fotos de fisioterapia, mesmo estilo visual).
- Atualizar `src/data/protocols.ts` para mapear `thumbnail_url` por `body_region` (helper `thumbFor(region)`), em vez de cores arbitrárias.
- `VideoPlayer.tsx`: aceitar e exibir a mesma imagem como poster do "vídeo" (já usa thumbnail; manter), mas melhorar o overlay (gradient + chip "Demo") para deixar claro que ainda não há vídeo real.

## 4. Navegação na página de exercícios
Hoje os cards em `_app.exercises.tsx` não são clicáveis. Mudanças:
- Em `ExerciseCard`, passar a aceitar `to` + `params` do TanStack Router em vez de `href` string genérica, e tornar o card sempre clicável quando informado.
- Em `_app.exercises.tsx`, envolver cada card com link para `/session/$sid/exercise/$eid` usando `sid: "today"` e `eid: ex.id`, permitindo abrir o detalhe do exercício direto da listagem (não só a partir da sessão).
- Garantir que `_app.session.$sid.exercise.$eid.tsx` lide com `sid="today"` (já lida) e adicionar um botão "Voltar para exercícios" quando a origem for a lista.

## 5. AI Doctor no Suporte (chat conversacional)
Resposta do usuário: **uma única conversa contínua**, **localStorage**.

### Backend (Lovable Cloud + Lovable AI Gateway)
- Habilitar Lovable Cloud (se ainda não estiver) — necessário para `LOVABLE_API_KEY` server-side.
- Criar `src/lib/ai-gateway.server.ts` com o helper canônico do `ai-sdk-lovable-gateway`.
- Criar rota de stream em `src/routes/api/chat.ts`:
  - `POST` recebe `{ messages: UIMessage[] }`.
  - Usa `streamText` com modelo `google/gemini-3-flash-preview`.
  - System prompt: "Você é o AI Doctor do FisioCare, um assistente conversacional para pacientes em reabilitação ortopédica de joelho. Responde em português, com tom acolhedor e claro. Sempre lembra que não substitui consulta médica, e em sinais de alerta (dor aguda, febre, instabilidade súbita) orienta procurar o médico responsável. Não diagnostica nem prescreve."
  - Injetar contexto resumido do tratamento ativo no system (nickname, fase, % adesão, dor média recente) — passado pelo cliente em cada request.

### Dependências
- `bun add ai @ai-sdk/openai-compatible @ai-sdk/react react-markdown`
- Instalar AI Elements: `bun x ai-elements@latest add conversation message prompt-input shimmer`.

### Frontend
- Substituir o conteúdo do `_app.support.tsx` por uma tela "AI Doctor":
  - Header: avatar do "doutor IA" (imagem gerada), nome "AI Doctor", subtítulo "Tire dúvidas sobre seu tratamento".
  - Aviso compacto: "Apoio educacional, não substitui consulta médica."
  - Componente `AiDoctorChat` em `src/components/support/AiDoctorChat.tsx` usando `useChat` (`DefaultChatTransport({ api: "/api/chat" })`).
  - Render com AI Elements: `Conversation`, `Message`/`MessageResponse` (assistant sem bubble; user bubble `primary`/`primary-foreground`), `PromptInput` + `PromptInputTextarea` + `PromptInputFooter` com `PromptInputSubmit`, `Shimmer "Pensando..."` no estado submitted.
  - Persistência em `localStorage` chave `fisiocare-aidoctor-v1` (UIMessage[]), com botão "Nova conversa" no header que limpa.
  - Sugestões iniciais (chips) quando vazio: "Posso voltar a correr?", "Estou sentindo estalos, é normal?", "Como aumento a intensidade?".
  - Antes do canal estar pronto: enviar `treatmentContext` (nickname/fase/adesão) no `body` do transport.
- Manter FAQ e WhatsApp/telefone numa aba/seção secundária ("Outras formas de ajuda") abaixo do chat, para não perder o conteúdo existente.

### Wiring TanStack
- Confirmar `src/start.ts` (sem mudanças necessárias se cloud não exigir auth para o chat — o endpoint é app-internal sem RLS).
- Sem persistência em banco; sem rota de thread.

## Detalhes técnicos
- Imagens geradas serão salvas em `src/assets/...` e importadas via ES6.
- Não vamos editar `src/routeTree.gen.ts` (regenera com o novo arquivo `src/routes/api/chat.ts`).
- Bump da chave de persistência **não** é necessário (somente novos campos opcionais em mock; store já carrega via `resetToDemo`).
- `MOCK_USER.avatar_url` opcional — render fallback preservado.

## Critérios de aceite
- Perfil mostra foto do Alexandre; iniciais ainda aparecem se `avatar_url` ausente.
- `/treatments/tr_patello_done` mostra gráfico de dor, frequência semanal e lista de sessões reais.
- Thumbnails dos exercícios são fotos (não SVG abstrato).
- Tap em um exercício na aba Exercícios abre a tela de detalhe do exercício.
- Em `/support`, conversar com o AI Doctor funciona (stream), com sugestões iniciais, persistência local e botão de nova conversa.
