
# Plano — MVP FisioCare (frontend interativo, sem backend)

Construir o MVP do FisioCare como app mobile-first com toda a jornada do paciente funcionando ponta a ponta, usando dados mockados e estado local persistido. Sem Supabase, sem FCM, sem Bunny.net por enquanto — mas com a arquitetura preparada para plugá-los depois.

## Adaptações em relação ao SPEC

O SPEC sugere React 18 + Vite + React Router v6 + Zustand + Tailwind v3. O projeto atual já vem com TanStack Start (React 19 + TanStack Router + Tailwind v4 + shadcn/ui), que é equivalente em capacidade e melhor para SSR/SEO. Mantenho **todo o design system, modelos de dados, mocks e telas** do SPEC. Trocas:

- **Roteamento:** TanStack Router (file-based em `src/routes/`) no lugar de React Router v6 — mesmas rotas.
- **Estado:** Zustand para estado global do paciente + persistência em `localStorage` (só para o MVP mock; SPEC pede Supabase, mas sem backend não há alternativa). Marcaremos com `TODO: migrar para Supabase`.
- **Vídeos:** placeholder `<video>` com poster (sem URLs reais do Bunny.net ainda) + fallback visual + contador de tempo simulado.
- **Push notifications, magic link, PDF export:** stubs de UI funcionais (botões/telas existem) mas sem integração real — claramente marcados.
- **Tailwind v4:** tokens do SPEC mapeados para `src/styles.css` em `oklch`, expostos como utilitários semânticos (`bg-primary`, `text-pain-high`, etc.).
- **Charts:** Recharts (já comum no stack shadcn).
- **Confete:** `canvas-confetti` (leve, sem React deps).

## Escopo das telas (todas do SPEC §8)

1. `/welcome` — boas-vindas + "Entrar" mock (sem magic link, só simula).
2. `/onboarding` — 5 steps (diagnóstico, dados pessoais, meta, preview, notificações) + celebração final.
3. `/home` — saudação, SessionCard do dia, frase motivacional dinâmica, quick stats, atividade recente.
4. `/exercises` — lista filtrável por região + banner da sessão de hoje.
5. `/exercises/session/:sid` — visão geral da sessão.
6. `/exercises/session/:sid/exercise/:eid` — player + instruções + stepper de fase da sessão + "Concluir exercício".
7. Check-in pós-sessão — 3 etapas (dor com EmojiPainScale, dificuldade, observação) + tela de celebração com badges desbloqueados.
8. `/progress` — hero dark, conquistas, gráficos (barras semanais, linha de dor), atividade recente, botão "Compartilhar com médico" (gera PDF mock via `jspdf`).
9. `/profile` — dados, recovery journey, settings (stubs).
10. `/support` — FAQ estático + botão WhatsApp (link `wa.me`).
11. Telas de conclusão de fase e de protocolo (modais fullscreen com confete).

## Dados e lógica

- 3 protocolos completos (LCA, Menisco, Patelofemoral) e MOCK_USER/MOCK_PRESCRIPTION/MOCK_PROGRESS do SPEC §5–6, em `src/data/`.
- Store Zustand (`src/store/patient.ts`) com seletores para: prescrição ativa, sessão de hoje, progresso derivado, badges, histórico de dor.
- Concluir sessão → atualiza streak, adesão, badges; persiste em localStorage; dispara modais corretos (badge novo, fase concluída, protocolo concluído).
- `checkNewBadges`, `getDynamicMessage`, `getEvolutionMessage` implementados conforme SPEC.
- Para demonstrar o app de cara, o store carrega o MOCK_PROGRESS (paciente Alexandre na Fase 2) por padrão. Botão "Resetar progresso (demo)" no `/profile` para voltar ao estado inicial.

## Arquitetura de arquivos

```
src/
  routes/
    __root.tsx                       (shell, providers, bottom nav condicional)
    index.tsx                         (redirect → /welcome ou /home)
    welcome.tsx
    onboarding.tsx                    (gerencia 5 steps internamente)
    _app.tsx                          (layout autenticado com bottom nav + <Outlet/>)
    _app.home.tsx
    _app.exercises.tsx
    _app.exercises.session.$sid.tsx
    _app.exercises.session.$sid.exercise.$eid.tsx
    _app.progress.tsx
    _app.profile.tsx
    _app.support.tsx
  components/
    layout/BottomNav.tsx
    session/SessionCard, ExerciseCard, EmojiPainScale, VideoPlayer, SessionStepper
    progress/PainTrendChart, WeeklyFrequencyChart, BadgeGrid, EvolutionHero
    celebration/Confetti, SessionComplete, PhaseComplete, ProtocolComplete
    ui/ (shadcn já existente)
  data/
    protocols/lca.ts, meniscus.ts, patellofemoral.ts
    mockUser.ts, badges.ts
  store/
    patient.ts (Zustand + persist)
  lib/
    badges.ts, dynamicMessages.ts, sessionScheduling.ts, pdfReport.ts
  styles.css (tokens do SPEC em oklch)
```

## Design system

Mapeio todas as cores do SPEC §3.1 para tokens semânticos em `src/styles.css` (oklch), incluindo `--pain-low/mid/high`, `--primary-navy` (hero dark), etc. Tipografia Inter via `<link>` do Google Fonts em `__root.tsx`. Componentes shadcn reutilizados (Button, Card, Tabs, Dialog, Sheet) com classes alinhadas ao SPEC.

## Dependências a adicionar

`zustand`, `recharts`, `canvas-confetti`, `jspdf`, `date-fns`. (Lucide, Tailwind, shadcn já presentes.)

## Fora de escopo (deixados como stubs marcados)

- Auth real (magic link)
- Supabase / persistência server-side
- Push notifications reais (FCM)
- Vídeos reais do Bunny.net (uso placeholders)
- PWA manifest + service worker (posso adicionar manifest básico se quiser, mas SW fica para depois)
- Painel médico

## Ordem de implementação

1. Tokens de design + fontes + layout base com bottom nav.
2. Mocks (3 protocolos, user, progress) + store Zustand com persist.
3. Welcome + Onboarding (5 steps).
4. Home + Exercises (lista + filtros) + Session overview.
5. Execução de exercício + Check-in + Celebração + lógica de badges.
6. Progresso (charts) + Profile + Support.
7. Telas de conclusão de fase e de protocolo + PDF de compartilhamento.
8. Polimento: animações, estados vazios, acessibilidade básica.

Quer que eu siga com este plano, ou prefere ajustar algo (ex: incluir PWA/manifest, ou simular auth com tela de login)?
