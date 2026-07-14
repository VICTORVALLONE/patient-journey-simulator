---
name: FisioApp
description: Fisioterapia guiada prescrita pelo médico — o fisioterapeuta de bolso do paciente pós-cirúrgico.
colors:
  azul-prescricao: "#2563EB"
  azul-profundo: "#1E3A8A"
  marinho-clinico: "#0F1C47"
  nevoa-azul: "#EFF6FF"
  tinta-marinho: "#1B2340"
  branco-consultorio: "#FFFFFF"
  repouso: "#F8FAFD"
  cinza-apoio: "#64748B"
  borda-suave: "#E4E9F2"
  verde-recuperacao: "#10B981"
  ambar-atencao: "#F59E0B"
  vermelho-alerta: "#EF4444"
typography:
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  md: "12px"
  lg: "14px"
  xl: "18px"
  "2xl": "22px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.azul-prescricao}"
    textColor: "{colors.branco-consultorio}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.branco-consultorio}"
    textColor: "{colors.tinta-marinho}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  card:
    backgroundColor: "{colors.branco-consultorio}"
    textColor: "{colors.tinta-marinho}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.branco-consultorio}"
    textColor: "{colors.tinta-marinho}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
---

# Design System: FisioApp

## 1. Overview

**Creative North Star: "O Fisioterapeuta de Bolso"**

Cada tela é uma presença profissional calorosa orientando um exercício, um dado, uma decisão de cada vez. O sistema visual traduz um consultório acolhedor — azuis de confiança clínica sobre superfícies claras e calmas — e rejeita explicitamente a estética de academia (intensidade, ranking), a gamificação infantilizada, a frieza de prontuário hospitalar e o SaaS genérico de IA (gradientes roxos, glassmorphism). O paciente está se recuperando de uma cirurgia: a interface apoia como um corrimão, nunca cobra.

A implementação é mobile-first dentro de um viewport de celular (`MobileFrame`), com tokens em OKLCH no CSS (`src/styles.css` é a fonte canônica de implementação; os hex deste arquivo são os equivalentes sRGB). Densidade baixa: uma tarefa primária por tela, alvos generosos, hierarquia clara.

**Key Characteristics:**
- Azul clínico como única família de acento; semânticos (verde/âmbar/vermelho) reservados a significado clínico
- Superfícies planas com bordas suaves; profundidade por camadas tonais, não por sombra
- Componentes firmes e acolhedores: cantos generosos (12–22px), presença sólida
- Motivação por evidência: gráficos e marcos são protagonistas, não confete

## 2. Colors

Paleta de consultório de confiança: azuis em três profundidades sobre neutros quentes de repouso, com semânticos exclusivamente clínicos.

### Primary
- **Azul Prescrição** (#2563EB / oklch(0.54 0.21 263)): a voz do app — ações primárias, links, anel de foco, progresso. É o azul da orientação médica em que se confia.
- **Azul Profundo** (#1E3A8A / oklch(0.32 0.18 265)): estados enfáticos e superfícies de destaque que precisam de mais peso que o Azul Prescrição.
- **Marinho Clínico** (#0F1C47 / oklch(0.22 0.12 268)): o navy dos heros e momentos de marca (planejado como protagonista do hero na spec 05).
- **Névoa Azul** (#EFF6FF / oklch(0.96 0.03 256)): fundos de apoio do acento — chips, realces suaves, estados selecionados.

### Neutral
- **Branco Consultório** (#FFFFFF): superfície de cards e do conteúdo principal.
- **Repouso** (#F8FAFD / oklch(0.985 0.012 256)): fundo sutil de áreas de apoio; cria a camada tonal sob os cards.
- **Tinta Marinho** (#1B2340 / oklch(0.18 0.04 265)): texto principal — um marinho-tinta, nunca preto puro.
- **Cinza Apoio** (#64748B / oklch(0.55 0.04 257)): texto secundário e metadados.
- **Borda Suave** (#E4E9F2 / oklch(0.92 0.012 256)): bordas e divisores — o contorno discreto que substitui sombras.

### Semantic (clinical)
- **Verde Recuperação** (#10B981): sucesso e o polo "sem dor" da escala; progresso confirmado.
- **Âmbar Atenção** (#F59E0B): avisos e o meio da escala de dor.
- **Vermelho Alerta** (#EF4444): erro, dor alta, tríade de alerta clínica.

### Named Rules
**A Regra da Escala de Dor.** O gradiente verde→âmbar→vermelho (`pain-low/mid/high`) pertence exclusivamente à semântica clínica de dor e alertas. Proibido usá-lo como decoração, categoria de gráfico ou cor de marca.

**A Regra do Acento Único.** O azul é a única família de acento da interface. Se uma tela pede uma segunda cor "de marca", a resposta é hierarquia tipográfica ou espaço — não uma cor nova.

## 3. Typography

**Body Font:** Inter (com ui-sans-serif, system-ui)

**Character:** Uma única sans humanista carregando toda a interface — legível em telas pequenas, neutra o bastante para deixar o dado clínico falar. *Nota: Inter está na lista de fontes batidas do detector; a troca por uma face com mais personalidade é decisão aberta da spec 05 — até lá, Inter é o padrão documentado.*

### Hierarchy
- **Headline** (700, 1.5rem, lh 1.2): título da tela; um por tela.
- **Title** (600, 1.125rem, lh 1.3): título de card e seção (`CardTitle` usa semibold com tracking-tight).
- **Body** (400, 0.875rem, lh 1.5): texto corrente, instruções de exercício.
- **Label** (500, 0.75rem): metadados, chips, navegação inferior.

### Named Rules
**A Regra da Instrução Completa.** Instrução de exercício é sempre legível como texto puro, sem depender do vídeo — pacientes com dados móveis limitados recebem a mesma orientação.

## 4. Elevation

Plano com bordas suaves. A profundidade vem de camadas tonais — **Repouso** (#F8FAFD) como fundo, **Branco Consultório** nos cards por cima — delimitadas pela **Borda Suave** (#E4E9F2). As sombras existentes (shadcn `shadow`/`shadow-sm`) são sussurros de separação, nunca dramatização; sombras aparecem como resposta a estado (hover, foco, modal), não como decoração permanente.

### Named Rules
**A Regra do Plano em Repouso.** Superfície parada é superfície plana. Se um card precisa "saltar", a causa deve ser um estado do usuário, não estilo.

## 5. Components

Firmes e acolhedores: presença de corrimão — alvos sólidos e cantos generosos que transmitem apoio físico, sem dureza. O paciente interage com uma mão, muitas vezes em posição desconfortável.

### Buttons
- **Shape:** cantos bem arredondados (12px, `rounded-md`)
- **Primary:** Azul Prescrição com texto branco; altura padrão 36px (h-9), variante `lg` 40px para ações principais de tela
- **Hover / Focus:** escurecimento sutil (`primary/90`); foco visível com anel de 1px no Azul Prescrição (`focus-visible:ring-1`)
- **Outline / Secondary / Ghost:** borda suave sobre fundo claro para ações secundárias; ghost apenas para ações terciárias em listas

### Cards / Containers
- **Corner Style:** generoso (18px, `rounded-xl`)
- **Background:** Branco Consultório sobre fundo Repouso
- **Shadow Strategy:** shadcn `shadow` discreto (ver Elevation — separação, não elevação)
- **Border:** Borda Suave 1px em todo o perímetro
- **Internal Padding:** 24px (p-6)

### Inputs / Fields
- **Style:** borda 1px Borda Suave, fundo transparente, cantos 12px, altura 36px
- **Focus:** anel de 1px no Azul Prescrição, sem glow
- **Error / Disabled:** disabled a 50% de opacidade com cursor bloqueado

### Navigation
- **Bottom nav fixa** dentro do `MobileFrame`: ícones lucide + Label 0.75rem; item ativo em Azul Prescrição, inativos em Cinza Apoio.

### Escala de Dor (signature)
Seletor 0–10 com apoio de emojis e o gradiente clínico verde→âmbar→vermelho — o componente mais próximo do paciente e o único lugar onde o gradiente semântico aparece inteiro. Alvos grandes, resposta imediata, zero julgamento visual.

## 6. Do's and Don'ts

### Do:
- **Do** usar o azul em três profundidades (Prescrição #2563EB → Profundo #1E3A8A → Marinho Clínico #0F1C47) para construir hierarquia dentro da mesma voz.
- **Do** dar à ação primária da tela um alvo generoso e óbvio — "um toque, uma decisão" (PRODUCT.md).
- **Do** celebrar com evidência: número real, curva real, marco da cartilha ("sua dor caiu 3 pontos"), em tom encorajador.
- **Do** manter toda instrução clínica legível sem vídeo e em linguagem simples.

### Don't:
- **Don't** usar estética de app de academia/fitness: ranking, competição, intensidade visual (anti-referência do PRODUCT.md).
- **Don't** usar gamificação infantilizada: mascotes, confete excessivo, pontuação lúdica — conquista aqui é clínica.
- **Don't** parecer sistema hospitalar/prontuário: tabelas densas, jargão médico, frieza burocrática.
- **Don't** usar clichês de SaaS de IA: gradientes roxos, glassmorphism, glow escuro, estética de template.
- **Don't** usar barra lateral colorida grossa em card (`border-left` > 1px como listra) — achado real do detector na home; usar fundo Névoa Azul ou hierarquia tipográfica no lugar.
- **Don't** aplicar o gradiente de dor fora da semântica de dor/alerta (A Regra da Escala de Dor).
- **Don't** punir visualmente: meta não atingida, streak quebrado ou dor alta jamais recebem vermelho de culpa — vermelho é alerta clínico, não reprovação.

*Estado conhecido: o dark mode atual em `styles.css` é o default slate do shadcn, sem a identidade navy — tratado como pendência da spec 05, não como parte deste sistema.*
