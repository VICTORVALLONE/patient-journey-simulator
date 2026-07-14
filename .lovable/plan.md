## Objetivo

Garantir 1 sessão por dia no histórico, substituir indicadores genéricos por métricas mais diretas de progresso clínico, e adicionar uma linha do tempo do tratamento mostrando o ponto atual do paciente.

## 1. Histórico: 1 sessão por dia

**`src/data/mockUser.ts` — `MOCK_TREATMENT_PATELLO_DONE`**

- Substituir a interpolação `startMs..endMs` por geração de datas em dias distintos respeitando `sessions_per_week` da fase (ex.: seg/qua/sex). Algoritmo: para cada fase, percorrer semanas e distribuir as N sessões da semana em dias fixos da semana sem repetir data.
- `weekly_frequency`: passar a representar a **última semana** com valores 0 ou 1 por dia (não 3), refletindo a regra "1/dia".

**`MOCK_TREATMENT_LCA_ACTIVE`**

- Popular `sessions` com 24 sessões em dias distintos terminando ontem (3x/semana), para o histórico aparecer também no tratamento ativo.
- `weekly_frequency`: 0/1 por dia da semana atual.

**`src/store/patient.ts` — `completeSession`**

- Se já existir `session.scheduled_date === todayISO()` no tratamento ativo, **não criar nova sessão** (no-op com retorno seguro). Evita duplicatas durante testes.
- `weekly_frequency`: marcar `sessions_done = 1` (não incrementar) no dia atual; `sessions_planned` permanece 0 ou 1.

## 2. Indicadores mais diretos

**Home (`_app.home.tsx`) — 3 cards:**

1. **Redução de dor** `((dorInicial − dorAtual) / dorInicial) × 100%` com seta ↓.
2. **Fase atual** `Fase X de N` com mini-barra.
3. **Sessões** `concluídas / prescritas`.

- "Dias seguidos" vira linha secundária, não KPI principal.

**Progresso (`_app.progress.tsx`) — bloco navy:**

- Mostrar **Redução de dor**, **Semanas concluídas / total**, **Sessões concluídas / prescritas**.
- Substituir "% adesão" (que era só completion) por **adesão real** = `sessoes_feitas / sessoes_esperadas_ate_hoje` (com `started_at` + `sessions_per_week`). Cap 100%.

**`src/lib/dynamicMessages.ts`**

- `getEvolutionMessage`: usar redução de dor + fase. Ex.: "Dor reduziu 58% · Fase 2 de 4".
- `getDynamicMessage`: priorizar redução de dor quando houver ≥2 entradas; streak depois.

## 3. Linha do tempo do tratamento (novo)

**Novo componente:** `src/components/progress/TreatmentTimeline.tsx`

- Renderiza uma barra horizontal segmentada por **fase** do protocolo (largura proporcional a `duration_weeks × sessions_per_week`).
- Cada segmento: nome da fase + nº de sessões.
- Preenchimento: porção concluída de cada fase em cor `primary`; restante em `muted`.
- Marcador "Você está aqui" (ícone + label) posicionado em `total_sessions_completed / total_sessions_prescribed`.
- Abaixo: datas-chave: `Início` (started_at), `Hoje`, `Previsão de término` (started_at + total_weeks × 7 dias).
- Texto resumo: "Semana X de N · Sessão Y de Z".
- Layout mobile-first; usa tokens semânticos (`bg-primary`, `bg-muted`, `text-foreground`).

**Integração em `_app.progress.tsx`:**

- Adicionar nova `<section>` "Linha do tempo" logo após o bloco navy de visão geral, antes de "Conquistas".
- Recebe `treatment` + `protocol` (já buscado via `getProtocol`).

## 4. Arquivos tocados

- `src/data/mockUser.ts` — geração de sessões (1/dia) + weekly_frequency 0/1; popular LCA com 24 sessões.
- `src/store/patient.ts` — guarda contra duplicata no dia; weekly_frequency idempotente.
- `src/lib/dynamicMessages.ts` — novas mensagens baseadas em dor/fase.
- `src/routes/_app.home.tsx` — novos 3 cards.
- `src/routes/_app.progress.tsx` — novos KPIs no bloco navy + seção da timeline.
- **Novo:** `src/components/progress/TreatmentTimeline.tsx`.

## Observação

Mantém compatibilidade com onboarding novo (treatments começam vazios; fórmulas tratam ausência de dados com fallback "—" e timeline 0%).
