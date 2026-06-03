## Visão geral

Separar o modelo atual em dois níveis:

- **Paciente** — dados pessoais (nome, nascimento, peso, altura, meta de recuperação, contato). Vivem 1x por usuário.
- **Tratamento** — uma prescrição + protocolo + progresso + sessões + badges, com início/fim próprios. Um paciente pode ter **N tratamentos**, vários **ativos ao mesmo tempo** (ex: joelho direito + ombro) e outros já **concluídos** (histórico).

Todos os indicadores (aderência, streak, dor, badges, fase atual, PDF) passam a ser **por tratamento**.

## Onboarding em duas camadas

1. **Onboarding pessoal** (3 etapas) — nome, nascimento/peso/altura, meta. Termina criando o paciente.
2. **Tela "Sem tratamento ativo"** na Home com CTA **"Iniciar tratamento"**.
3. **Onboarding de tratamento** (3 etapas) — tipo de lesão, lado afetado + data de cirurgia, médico prescritor + horário de lembrete. Cria o tratamento e ativa.

O mesmo fluxo de "Iniciar tratamento" é reutilizado depois para adicionar um 2º, 3º tratamento a qualquer momento.

## Mudanças de UX

- **Home** — chip horizontal no topo "Meus tratamentos" listando os ativos (LCA · Joelho D, Manguito · Ombro E, +). Toque troca o tratamento em foco; o restante da Home (sessão de hoje, mensagem dinâmica, streak) reflete o selecionado. Botão **"+ Novo tratamento"** no fim do chip.
- **Exercícios** — sempre do tratamento em foco; subtítulo mostra qual é.
- **Sessão / Check-in** — não muda visualmente; grava no tratamento em foco.
- **Progresso** — gráficos, badges e PDF do tratamento em foco; chip de troca igual ao da Home. PDF passa a citar nome do tratamento e período.
- **Perfil** — seção **"Tratamentos"** lista ativos e concluídos com status, data início/fim, % aderência e link para detalhes (read-only para concluídos). Botão "Iniciar novo tratamento". Dados pessoais editáveis em bloco separado.

## Mudanças técnicas

**Tipos (`src/lib/types.ts`)**
- `User` enxuto: só dados pessoais (remover `recovery_goal` daqui? não — manter, é pessoal).
- Novo `Treatment` = junta `Prescription` + `Progress` + lista de `Session` + `badges_unlocked` + `current_phase` + `started_at` / `completed_at` + `nickname` ("Joelho direito").
- `Session.treatment_id` substitui `prescription_id`.

**Store (`src/store/patient.ts`)**
```
{
  isOnboarded: boolean,
  user: User,
  treatments: Treatment[],
  activeTreatmentId: string | null,   // tratamento em foco na UI
  onboardingDraft: { user?, treatment? }
}
```
Ações novas/refatoradas:
- `completePersonalOnboarding(draft)` — cria User, isOnboarded=true, treatments=[].
- `startTreatment(draft)` — cria Treatment, adiciona em treatments, vira o activeTreatmentId.
- `setActiveTreatment(id)` — troca foco.
- `completeSession(input)` — opera sobre `activeTreatmentId` (mesma lógica de hoje, só escopada).
- `pauseTreatment(id)` / `completeTreatment(id)` — muda status.
- `resetToDemo` — passa a popular `user` + 1 Treatment LCA ativo + 1 Patelofemoral concluído (mostra histórico).
- `resetToInitial` — só user, sem tratamentos (para testar a tela vazia).

Helpers:
- `getActiveTreatment(state)`, `currentPhaseOf(treatment)`, `todaySessionInfoOf(treatment)`.
- `getDynamicMessage` / badges / PDF passam a receber `Treatment` em vez de `Progress` solto.

**Rotas**
- `/welcome` — inalterado.
- `/onboarding` — passa a ter apenas as 3 etapas pessoais. Ao final, vai para `/home`.
- **Nova** `/onboarding/treatment` — 3 etapas do tratamento; usada tanto no fluxo inicial (CTA da home vazia) quanto para adicionar novos.
- `/_app/home` — adiciona `<TreatmentSwitcher />` no topo; se `treatments.length === 0`, mostra empty-state com CTA.
- `/_app/exercises`, `/_app/progress`, `/_app/session/...` — leem do tratamento ativo.
- **Nova** `/_app/treatments` (acessível pelo perfil) — lista todos com filtros Ativos / Concluídos; toque abre `/_app/treatments/$tid` com resumo + PDF + badges (read-only se concluído).

**Componentes novos**
- `components/treatment/TreatmentSwitcher.tsx` — chips horizontais + "+ Novo".
- `components/treatment/EmptyTreatmentState.tsx` — usado na Home quando não há tratamento.
- `components/treatment/TreatmentCard.tsx` — usado no Perfil e na lista de tratamentos.

**Mocks (`src/data/mockUser.ts`)**
- `MOCK_USER` perde campos de prescrição.
- Novo `MOCK_TREATMENT_LCA_ACTIVE` (fase 2, 24/36 sessões — equivalente ao demo atual).
- Novo `MOCK_TREATMENT_PATELLO_DONE` (concluído, 100% aderência, PDF disponível).
- `resetToDemo` carrega ambos; activeTreatmentId = LCA.

**Migrações de UI sutis**
- BottomNav inalterada.
- PDF (`pdfReport.ts`) recebe `Treatment` e inclui o nome/data do tratamento no cabeçalho.
- LocalStorage: bump da chave para `fisiocare-patient-v2` (descarta estado antigo automaticamente; não há backend ainda).

## Fora do escopo deste passo

- Backend / Supabase / sync entre dispositivos.
- Edição/arquivamento de tratamentos pelo paciente (médico que faz).
- Notificações push reais.
- Comparativo entre tratamentos do mesmo paciente (futuro).

## Estrutura final de arquivos (deltas)

```text
src/
  lib/types.ts                    (refatorado: + Treatment, User enxuto)
  store/patient.ts                (refatorado: treatments[] + activeTreatmentId)
  data/mockUser.ts                (refatorado: user + 2 treatments demo)
  lib/pdfReport.ts                (recebe Treatment)
  lib/dynamicMessages.ts          (recebe Treatment)
  components/treatment/
    TreatmentSwitcher.tsx         (novo)
    EmptyTreatmentState.tsx       (novo)
    TreatmentCard.tsx             (novo)
  routes/
    onboarding.tsx                (encolhe para 3 etapas pessoais)
    onboarding.treatment.tsx      (novo, 3 etapas do tratamento)
    _app.home.tsx                 (switcher + empty state)
    _app.exercises.tsx            (lê tratamento ativo)
    _app.progress.tsx             (lê tratamento ativo + switcher)
    _app.session.$sid.tsx         (lê tratamento ativo)
    _app.session.$sid.exercise.$eid.tsx  (lê tratamento ativo)
    _app.profile.tsx              (seção Tratamentos + link p/ lista)
    _app.treatments.tsx           (novo, lista)
    _app.treatments.$tid.tsx      (novo, detalhe read-only)
```
