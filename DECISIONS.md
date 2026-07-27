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
