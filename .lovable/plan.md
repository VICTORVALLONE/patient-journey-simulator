## Plano de ajustes

### 1. Botão "Reiniciar conversa" no AI Doctor
- Em `src/components/support/AiDoctorChat.tsx`, adicionar um botão visível no header (ícone `RotateCcw` + label "Reiniciar") que chama `setMessages([])` e limpa `localStorage[fisiocare-aidoctor-v1]`.
- Mostrar confirmação leve via `toast` (sonner) e reaplicar sugestões iniciais.

### 2. Popup do AI Doctor durante exercícios
- Criar `src/components/support/AiDoctorSheet.tsx`: um `Sheet`/`Dialog` (shadcn) que envolve `<AiDoctorChat />` com altura ~85vh.
- Em `src/routes/_app.session.$sid.exercise.$eid.tsx`, adicionar um FAB flutuante (canto inferior direito, acima do rodapé fixo, ícone de balão/estetoscópio com avatar do AI Doctor) que abre o sheet.
- O chat reutiliza a mesma chave de `localStorage`, mantendo a continuidade da conversa.
- O popup só aparece no estágio `exercise` (não em `checkin`/`celebrate`).

### 3. Corrigir jornada das fases da sessão (warmup → ativo → pico → descanso)
- Causa: os exercícios em `src/data/protocols.ts` aparecem em ordem livre (ex.: `active`, `active`, `warmup`, `warmup`), então o `SessionStepper` salta de "Ativo" para "Aquecimento" conforme avança.
- Em `src/store/patient.ts` (`todaySessionInfoOf` ou novo helper `orderedExercisesOf(phase)`), ordenar os exercícios da fase ativa por `session_phase` na ordem fixa `warmup → active → peak → rest` (estável dentro de cada fase).
- Aplicar essa ordenação ao construir `today.phase.exercises` consumido por `_app.session.$sid.tsx` e `_app.session.$sid.exercise.$eid.tsx` para que `SessionStepper` avance corretamente.
- O `SessionStepper` continua mostrando a fase do exercício atual; com a nova ordenação a barra preenche progressivamente.

### 4. Foto do Alexandre no perfil
- Causa provável: o `zustand/persist` guardou o `user` antes do campo `avatar_url` existir; o snapshot do localStorage sobrescreve o `MOCK_USER` atualizado.
- Em `src/store/patient.ts`, no `persist`, adicionar `version: 2` e `migrate` que injeta `avatar_url` no usuário existente se for o `MOCK_USER` (mesmo `id`) e estiver vazio.
- Como complemento de robustez, também mostrar o avatar via fallback do `MOCK_USER` quando o `user.id` coincidir.

### 5. Jornada de criação de perfil (para testes)
- Em `src/routes/_app.profile.tsx`, adicionar item na seção de configurações: "Testar criação de perfil" (ícone `UserPlus`).
- Ao clicar: `logout()` + `navigate({ to: "/onboarding" })` para executar do zero a coleta de dados pessoais (`onboarding.tsx`) seguida de `onboarding.treatment.tsx`.
- Manter os botões existentes "Resetar para demo" e "Resetar para inicial".

### 6. Realismo das imagens
- Regenerar com `imagegen` no modelo `premium` e prompts mais específicos/fotográficos:
  - `src/assets/avatar-alexandre.jpg`: retrato realista de homem brasileiro ~35 anos, sorriso natural, fundo neutro suave, luz de estúdio, foto profissional.
  - `src/assets/thumb-joelho.jpg`, `thumb-quadril.jpg`, `thumb-tornozelo.jpg`, `thumb-core.jpg`: still frames realistas de fisioterapia (paciente + fisioterapeuta) focados na região correspondente, sem texto, sem rostos distorcidos, paleta consistente (clínica clara, tons azulados).
- Validar visualmente cada imagem antes de finalizar.

### Dependências/arquivos tocados
- Edita: `AiDoctorChat.tsx`, `_app.session.$sid.exercise.$eid.tsx`, `store/patient.ts`, `_app.profile.tsx`, `data/protocols.ts` (apenas se for necessário desempate de ordem).
- Cria: `components/support/AiDoctorSheet.tsx`.
- Regenera assets em `src/assets/`.

### Observações técnicas
- O `AiDoctorChat` aceita renderizar dentro de um `Sheet`; como já usa `localStorage`, instâncias paralelas (Support e popup) compartilham histórico via storage, mas mantendo o mesmo `id="ai-doctor"` no `useChat` evita divergência de estado entre abertas/fechadas (recarrega ao montar).
- Migração do `persist`: bump de `version` invalida apenas o snapshot antigo; usuários no demo voltam a ter avatar.
