# GLOSSARY.md — glossário clínico e de produto (FisioApp)

Atalho de contexto para os termos que aparecem espalhados pelo código, specs e docs. **Fonte de verdade clínica = a cartilha** (`../docs/cartilha-lca-limpa.txt`, extração do manual oficial de LCA); este glossário sintetiza, não substitui. Onde um termo tem casa canônica, o verbete aponta para ela.

## Recuperação e medição

- **ADM / ROM** — Amplitude de Movimento (Range of Motion). Ângulo de flexão do joelho, em graus. É o **marcador mensurável objetivo** dentro de cada fase pós-op. Curva-alvo da cartilha: 90° → 100° → 110° → 120° → máx.
- **Curva-alvo** — a trajetória esperada de ADM por semana pós-op (90/100/110/120…). O **gráfico principal de recuperação** é _ADM real × curva-alvo_ + tendência de dor. Reusa `clinical_guide.weeks`/`getWeekGuide` de `src/data/protocols.ts` (sem seed novo). Ver spec 01 (`docs/specs/01-modelo-medicao-adm/`).
- **Semana pós-operatória (pós-op)** — o **eixo** do protocolo. A progressão de fase é travada por semanas pós-op (não por contagem de sessões concluídas — modelo antigo). Derivada da data de cirurgia (`surgery_date` em `Treatment`, fallback `started_at`).
- **Progressão de fase** — avanço do paciente pelas fases do protocolo, governada pelo calendário (semanas pós-op) com a meta de ADM da semana como check de prontidão. Meta não atingida **informa**, não segura a fase — segurar exercício é decisão do médico (ver `DECISIONS.md`, Q2).
- **Adesão (adherence)** — % de sessões prescritas concluídas. Métrica de engajamento, não de desfecho clínico.
- **Streak** — dias consecutivos com sessão concluída. Gamificação (`src/data/badges.ts`).

## Sinais de alerta (da cartilha)

- **Tríade de alerta** — os três sinais que a cartilha repete como bandeira vermelha: **dor, inchaço, instabilidade**. Hoje o app captura só `pain_level`; inchaço e instabilidade estão adiados (backlog da Camada 1).
- **Sinal de Lag** — inibição/atraso de ativação do quadríceps: o paciente não consegue estender ativamente o joelho até o fim, embora a extensão passiva exista. Vigiado sobretudo na elevação de perna (2ª semana). Marcador de fraqueza do quadríceps.

## Anatomia e exercício

- **VMO** — Vasto Medial Oblíquo, porção interna do quadríceps crítica para o alinhamento patelar. Alvo central no protocolo patelofemoral (hoje "em breve").
- **Cadeia cinética fechada** — exercício com o pé fixo apoiado (ex.: agachamento, leg press); mais seguro para o joelho pós-LCA nas fases iniciais.
- **Marcos funcionais** — metas genéricas por semana, direto da cartilha (seed estático por protocolo, sem customização por paciente no MVP): andar sem muleta (4ª sem), corrida leve (10ª sem), retorno ao esporte (≥ 6 meses).

## Escopo clínico

- **LCA** — Ligamento Cruzado Anterior. **Foco atual do produto.** Protocolo de 24 semanas espelhando a cartilha.
- **Menisco / Patelofemoral** — os outros dois protocolos de joelho; existem no código (`src/data/protocols.ts`) mas estão marcados **"em breve"** no onboarding.

## Modelo de medição — 3 camadas (travado)

Resumo; detalhe e porquê em `../STATUS-medicao-recuperacao.md` (workspace) e na spec 01.

1. **Camada 1 — checagem por sessão:** `pain_level` (existe) + "atingiu a meta de ADM da semana?" (sim/não, a construir). Tríade completa adiada.
2. **Camada 2 — PRO validado (KOOS-JR):** **dropada do MVP** (sem respaldo na cartilha); backlog com aval clínico.
3. **Camada 3 — marcos funcionais:** genéricos por semana, da cartilha.
