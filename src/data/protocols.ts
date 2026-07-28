import type { BodyRegion, Exercise, InjuryType, Protocol, WeekGuideEntry } from "@/lib/types";
import { videoByCatalogNumber } from "@/data/videos";
import thumbJoelho from "@/assets/thumb-joelho.jpg";
import thumbQuadril from "@/assets/thumb-quadril.jpg";
import thumbTornozelo from "@/assets/thumb-tornozelo.jpg";
import thumbCore from "@/assets/thumb-core.jpg";

const THUMB_BY_REGION: Record<BodyRegion, string> = {
  joelho: thumbJoelho,
  quadril: thumbQuadril,
  tornozelo: thumbTornozelo,
  core: thumbCore,
};

// Aliases kept for backwards-compat of existing object literals below.
// Each exercise's thumbnail will be overridden by body_region after the fact.
const T1 = thumbJoelho;
const T2 = thumbQuadril;
const T3 = thumbTornozelo;

export const PROTOCOL_LCA: Protocol = {
  id: "proto_lca",
  injury_type: "lca",
  name: "Recuperação de LCA",
  total_weeks: 24,
  sessions_per_week: 3,
  // Guia clínico extraído do "Manual de Orientação — Ligamento Cruzado Anterior"
  // (fonte da verdade: App/docs/FINALIZADA - CARTILHA DE LCA .pdf).
  clinical_guide: {
    source_title: "Manual de Orientação — Ligamento Cruzado Anterior",
    source_authors: "Ms. José Carlos Baldocchi Pontin, Esp. Adriana Cano Buric Da Silva e equipe",
    safety_alert:
      "Observe se há dor, inchaço ou instabilidade. Caso haja algum desses sintomas, avise seu fisioterapeuta.",
    lag_sign_note:
      "Sinal de Lag: inibição do quadríceps — dificuldade para elevar a perna ou esticá-la por completo. Se ocorrer, não realize as elevações de perna e avise seu fisioterapeuta.",
    return_to_sport_note:
      "O retorno ao esporte não ocorre antes de 6 meses de pós-operatório e depende de liberação médica.",
    weeks: [
      {
        week_start: 1,
        week_end: 1,
        rom_target_degrees: 90,
        rom_target_label: "Dobrar o joelho até 90°",
        // Diária: a cartilha prescreve estes cuidados 3× ao dia, não 3× na
        // semana. A adesão da semana 1 conta DIAS, não doses — o app não tem
        // como saber se foram 1 ou 3 aplicações de gelo.
        sessions_per_week: 7,
        milestones: [
          "Marcha com muletas (tipo de carga conforme orientação do cirurgião)",
          "Gelo (crioterapia): 30 min, 3x ao dia, com intervalo mínimo de 1h",
          "Alongamento com joelho esticado: 30 min, 3x ao dia",
        ],
        caution:
          "Mantenha o joelho esticado a maior parte do tempo — não coloque apoio embaixo dele, exceto por restrições do tipo de cirurgia.",
      },
      {
        week_start: 2,
        week_end: 2,
        rom_target_degrees: 100,
        rom_target_label: "Dobrar o joelho até 100°",
        milestones: [
          "Marcha com uma muleta (do lado oposto à perna operada, com liberação médica)",
          "Apoio em um pé (lado não operado): 3x de 30 segundos",
        ],
        caution: "Atenção ao sinal de Lag nas elevações de perna.",
      },
      {
        week_start: 3,
        week_end: 3,
        rom_target_degrees: 110,
        rom_target_label: "Dobrar o joelho até 110°",
        milestones: [
          "Pedalar bicicleta ergométrica por 10 min",
          "Ponte e mini agachamento (até 30°)",
        ],
      },
      {
        week_start: 4,
        week_end: 4,
        rom_target_degrees: 120,
        rom_target_label: "Dobrar o joelho até 120° (amplitude máxima)",
        milestones: ["Andar SEM muletas em linha reta", "Ponta dos pés"],
      },
      {
        week_start: 5,
        week_end: 7,
        rom_target_label: "Manter a amplitude máxima",
        milestones: [
          "Carga progressiva nos exercícios (peso definido pelo fisioterapeuta)",
          "Subir e descer degraus",
          "Isometria de quadríceps (90°)",
        ],
        caution:
          "Dobrar e esticar o joelho em pé (90°–45°): liberado apenas para reconstrução com tendão patelar — consulte seu médico.",
      },
      {
        week_start: 8,
        week_end: 9,
        rom_target_label: "Amplitude máxima",
        milestones: ["Prancha", "Avanço/afundo", "Agachamento médio (até 60°)"],
      },
      {
        week_start: 10,
        week_end: 11,
        rom_target_label: "Amplitude máxima",
        milestones: ["Corrida leve: 15 min em linha reta", "Saltos com as duas pernas"],
        caution:
          "Na corrida e nos saltos: observe dor, inchaço ou instabilidade — avise seu fisioterapeuta.",
      },
      {
        week_start: 12,
        week_end: 12,
        rom_target_label: "Amplitude máxima",
        milestones: ["Exercícios com carga (3 kg)", "Ponte com elevação de perna"],
        caution: "Dor, inchaço ou instabilidade → avise seu fisioterapeuta.",
      },
      {
        week_start: 13,
        week_end: 16,
        rom_target_label: "Amplitude máxima",
        milestones: [
          "Salto com obstáculo (aterrissagem em um pé)",
          "Salto unipodal",
          "Carga de 4 kg nos exercícios",
        ],
        caution:
          "Nos saltos e na corrida: dor, inchaço ou instabilidade → avise seu fisioterapeuta.",
      },
      {
        week_start: 17,
        week_end: 24,
        rom_target_label: "Amplitude máxima",
        milestones: [
          "Movimentos esportivos: corte, chute e giro",
          "Tiros de 3 m com desaceleração em uma perna",
          "Corrida em oito entre cones",
          "Retorno ao esporte: somente após 6 meses e com liberação médica",
        ],
        caution: "Dor, inchaço ou instabilidade em qualquer atividade → avise seu fisioterapeuta.",
      },
    ],
  },
  phases: [
    {
      id: "lca_phase_1",
      phase_number: 1,
      name: "Controle de Edema e Dor",
      duration_weeks: 2,
      // Governa a semana 2. A semana 1 é diária e declara a própria cadência em
      // `clinical_guide.weeks[0].sessions_per_week`.
      sessions_per_week: 3,
      focus:
        "Semanas 1–2 · Cuidados diários na 1ª semana; reduzir o inchaço, controlar a dor e dobrar o joelho até 90–100°",
      doctor_message:
        "Parabéns por concluir a Fase 1. Seu edema está sob controle e sua amplitude de movimento está melhorando. Na próxima fase, vamos focar na mobilidade articular.",
      // Semana 1 (display_order 1–6) espelha a ordem da cartilha; a semana 2
      // (7–8) acrescenta as elevações de perna, que a cartilha só introduz ali.
      exercises: [
        {
          id: "ex_alongamento_joelho_esticado",
          name: "Alongamento com o Joelho Esticado",
          description:
            "Mantém a extensão completa do joelho — o ganho mais difícil de recuperar se for perdido.",
          instructions: [
            "Deite de barriga para cima com a perna operada esticada",
            "Não coloque nada embaixo do joelho: ele precisa ficar reto",
            "Mantenha por 30 minutos, 3 vezes ao dia",
            "Se estiver difícil, apoie só o calcanhar num rolinho e ponha um peso de 2 a 5 kg sobre a coxa",
          ],
          duration_seconds: 1800,
          times_per_day: 3,
          rest_seconds: 0,
          difficulty: 1,
          body_region: "joelho",
          week_start: 1,
          week_end: 1,
          display_order: 1,
          video: videoByCatalogNumber(1),
        },
        {
          id: "ex_crioterapia",
          name: "Gelo (Crioterapia)",
          description: "Controla o inchaço e a dor na primeira semana.",
          instructions: [
            "Aplique gelo sobre o joelho por 30 minutos",
            "Repita 3 vezes ao dia, com pelo menos 1 hora de intervalo entre as aplicações",
            "Use uma barreira de pano entre o gelo e a pele",
          ],
          kind: "care",
          duration_seconds: 1800,
          times_per_day: 3,
          min_interval_hours: 1,
          safety_stop:
            "Se houver irritação ou mudança na cor da pele, interrompa e avise seu médico.",
          rest_seconds: 0,
          difficulty: 1,
          body_region: "joelho",
          week_start: 1,
          week_end: 1,
          display_order: 2,
          video: videoByCatalogNumber(2),
        },
        {
          id: "ex_mobilizacao_patela",
          name: "Mobilização Patelar",
          description: "Previne aderências e mantém a patela móvel após a cirurgia.",
          instructions: [
            "Segure o osso da patela (rótula) com os dedos",
            "Mobilize para cima e para baixo 30 vezes",
            "Depois, mobilize de um lado para o outro mais 30 vezes",
          ],
          reps: 30,
          rest_seconds: 30,
          thumbnail_url: T3,
          difficulty: 1,
          body_region: "joelho",
          week_start: 1,
          week_end: 1,
          display_order: 3,
          video: videoByCatalogNumber(22),
        },
        {
          id: "ex_pump_tornozelo",
          name: "Movimentos de Tornozelo",
          description: "Estimula a circulação e reduz o inchaço no pós-operatório.",
          instructions: [
            "Movimente os pés para frente e para trás, como se apertasse um pedal",
            "Faça 30 vezes seguidas, sem pausar",
            "Repita 3 vezes ao dia",
          ],
          // Antes: `sets: 3` codificava "3× ao dia" — o app somava três séries
          // dentro de uma sessão. Agora a frequência diária tem campo próprio.
          reps: 30,
          times_per_day: 3,
          rest_seconds: 20,
          thumbnail_url: T2,
          difficulty: 1,
          body_region: "tornozelo",
          week_start: 1,
          week_end: 1,
          display_order: 4,
          video: videoByCatalogNumber(3),
        },
        {
          id: "ex_dobrar_joelhos_parede",
          name: "Dobrar os Joelhos (na Parede)",
          description: "Recupera a amplitude de flexão — meta de 90° na 1ª semana e 100° na 2ª.",
          instructions: [
            "Deitado, apoie as pernas na parede e dobre o joelho operado até a meta da semana",
            "Coloque a perna não operada sobre a operada e force suavemente para baixo",
          ],
          reps: 30,
          rest_seconds: 30,
          thumbnail_url: T1,
          difficulty: 1,
          body_region: "joelho",
          week_start: 1,
          week_end: 2,
          display_order: 5,
          video: videoByCatalogNumber(23),
          variants: [
            {
              id: "ex_dobrar_joelhos_cadeira",
              label: "Sentado na cadeira",
              instructions: [
                "Sentado em uma cadeira, deslize o pé operado para trás",
                "Use a perna não operada à frente do tornozelo para ajudar a dobrar",
              ],
              video: videoByCatalogNumber(24),
            },
          ],
        },
        {
          id: "ex_treino_marcha",
          name: "Treino de Marcha",
          description: "Como andar com muletas nesta fase, conforme a liberação do seu cirurgião.",
          instructions: [
            "Ande com as duas muletas, apoiando a perna operada conforme a orientação abaixo",
            "Dê passos curtos e mantenha o joelho esticado ao apoiar o pé no chão",
          ],
          // Sem vídeo, e isto NÃO é lacuna: um vídeo genérico de marcha é
          // clinicamente errado para quem está em carga zero. O parâmetro
          // abaixo é o que muda a instrução, e quem o define é o cirurgião.
          kind: "instruction",
          rest_seconds: 0,
          difficulty: 1,
          body_region: "joelho",
          week_start: 1,
          week_end: 1,
          display_order: 6,
          parameter: {
            key: "load_type",
            label: "Tipo de carga liberado pelo cirurgião",
            options: [
              {
                value: "partial",
                label: "Carga parcial",
                detail: "Apoie parte do peso na perna operada, conforme tolerar.",
              },
              {
                value: "touch",
                label: "Toque de marcha",
                detail: "Apenas encoste o pé no chão para equilíbrio, sem descarregar peso.",
              },
              {
                value: "none",
                label: "Carga zero",
                detail: "Não apoie a perna operada no chão em nenhum momento.",
              },
            ],
            fallback_text:
              "Confirme com seu cirurgião quanto peso pode apoiar na perna operada antes de treinar a marcha.",
          },
        },
        {
          id: "ex_elevacao_membro",
          name: "Elevação da Perna",
          description: "Ativa o quadríceps com o joelho esticado — atenção ao sinal de Lag.",
          instructions: [
            "Deite de costas com a perna não operada dobrada e o pé apoiado no chão",
            "Eleve a perna operada esticada até o nível do outro joelho e desça sem encostar no chão",
            "Em caso de sinal de Lag (não conseguir esticar/elevar), não realize e avise seu fisioterapeuta",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 45,
          thumbnail_url: T2,
          difficulty: 1,
          session_phase: "active",
          body_region: "quadril",
          week_start: 2,
          display_order: 7,
        },
        {
          id: "ex_elevacao_lateral",
          name: "Elevação Lateral da Perna",
          description: "Fortalece o quadril e estabilizadores sem carga no joelho.",
          instructions: [
            "Deite de lado com a perna operada por cima, esticada e levemente para trás",
            "Eleve a perna de cima e retorne sem encostar no chão",
            "Não deixe o quadril cair para trás durante o movimento",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 30,
          thumbnail_url: T2,
          difficulty: 1,
          session_phase: "active",
          body_region: "quadril",
          week_start: 2,
          display_order: 8,
        },
      ],
    },
    {
      id: "lca_phase_2",
      phase_number: 2,
      name: "Recuperação de Mobilidade",
      duration_weeks: 4,
      sessions_per_week: 4,
      focus:
        "Semanas 3–6 · Amplitude até 120°, primeiros exercícios em pé — e andar sem muletas na 4ª semana",
      doctor_message:
        "Excelente trabalho na Fase 2. Sua mobilidade melhorou muito. Agora entramos na fase mais importante: o fortalecimento muscular.",
      exercises: [
        {
          id: "ex_pedalar",
          name: "Pedalar (Bicicleta Ergométrica)",
          description: "Melhora a mobilidade do joelho sem impacto — dobre até a meta da semana.",
          instructions: [
            "Pedale em bicicleta ergométrica por 10 minutos",
            "Dobre os joelhos até cerca de 110°, conforme a meta da semana",
            "Pedaladas leves e contínuas, sem dor",
          ],
          duration_seconds: 600,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 1,
          session_phase: "warmup",
          body_region: "joelho",
        },
        {
          id: "ex_flexao_ativa",
          name: "Dobrar e Esticar o Joelho",
          description: "Recupera progressivamente a amplitude de flexão até o máximo possível.",
          instructions: [
            "Deitado de barriga para cima, dobre e estique a perna operada até o máximo possível",
            "Na parede: apoie as pernas e force suavemente com a perna não operada",
            "Avance apenas até resistência moderada — nunca dor forte",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 45,
          thumbnail_url: T1,
          difficulty: 2,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_ponte",
          name: "Ponte",
          description: "Fortalece glúteos e posterior de coxa sem carga no joelho.",
          instructions: [
            "Deite de barriga para cima com as duas pernas dobradas",
            "Levante o quadril e segure a posição por 20 a 30 segundos",
            "Retorne à posição inicial com controle",
          ],
          sets: 3,
          duration_seconds: 20,
          rest_seconds: 45,
          thumbnail_url: T2,
          difficulty: 1,
          session_phase: "active",
          body_region: "quadril",
        },
        {
          id: "ex_abducao_quadril",
          name: "Elevação Medial (Perna de Baixo)",
          description: "Fortalece a parte interna da coxa e estabilizadores do quadril.",
          instructions: [
            "Deite de lado e apoie a sola do pé de cima na frente da perna que está por baixo",
            "Eleve a perna de baixo e retorne sem encostar no chão",
            "Movimento lento e controlado",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 30,
          thumbnail_url: T2,
          difficulty: 2,
          session_phase: "active",
          body_region: "quadril",
        },
        {
          id: "ex_ponta_dos_pes",
          name: "Ponta dos Pés",
          description: "Fortalece a panturrilha em pé, com apoio.",
          instructions: [
            "Em pé, com as mãos apoiadas em uma cadeira ou parede",
            "Erga os calcanhares do chão e retorne à posição inicial",
            "Faça o movimento devagar, sem impulso",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 30,
          thumbnail_url: T3,
          difficulty: 1,
          session_phase: "active",
          body_region: "tornozelo",
        },
        {
          id: "ex_mini_agachamento",
          name: "Mini Agachamento (até 30°)",
          description: "Inicia carga em pé de forma segura — flexão limitada a 30°.",
          instructions: [
            "Em pé, com os braços direcionados para frente, realize um mini agachamento",
            "A flexão do joelho não deve ultrapassar 30° — segure 10 segundos em cada repetição",
            "Não deixe o joelho ir para dentro; faça de frente para um espelho",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 2,
          session_phase: "peak",
          body_region: "joelho",
        },
      ],
    },
    {
      id: "lca_phase_3",
      phase_number: 3,
      name: "Fortalecimento Muscular",
      duration_weeks: 10,
      sessions_per_week: 4,
      focus:
        "Semanas 7–16 · Carga progressiva, prancha, agachamento médio — e corrida leve a partir da 10ª semana",
      doctor_message:
        "Você chegou à fase mais longa e transformadora. Foque na qualidade de cada movimento.",
      exercises: [
        {
          id: "ex_pedalar_forte",
          name: "Pedalar (Bicicleta Ergométrica)",
          description: "Aquecimento e mobilidade — pedale dobrando os joelhos até 110°.",
          instructions: [
            "Pedale em bicicleta ergométrica por 10 minutos",
            "Dobre os joelhos até 110°",
            "Ritmo confortável e contínuo",
          ],
          duration_seconds: 600,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 1,
          session_phase: "warmup",
          body_region: "joelho",
        },
        {
          id: "ex_subida_degrau",
          name: "Subir e Descer Degraus",
          description: "Fortalecimento funcional em cadeia cinética fechada.",
          instructions: [
            "Em pé, apoie a perna a ser exercitada em um degrau",
            "Incline o tronco para frente, suba e desça o degrau com a mesma perna",
            "Realize também com o outro lado",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T3,
          difficulty: 2,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_quad_isometrico",
          name: "Isometria de Quadríceps (90°)",
          description: "Fortalece o quadríceps sem movimento articular.",
          instructions: [
            "Sentado, coloque a perna não operada na frente da perna operada",
            "Faça força para esticar o joelho operado enquanto a outra perna impede o movimento",
            "Segure por 6 segundos em cada repetição",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 30,
          thumbnail_url: T1,
          difficulty: 2,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_prancha",
          name: "Prancha",
          description: "Fortalece o core — base para estabilidade do movimento.",
          instructions: [
            "De barriga para baixo, apoie joelhos e cotovelos no chão, olhando para baixo",
            "Eleve o quadril e mantenha os joelhos esticados",
            "Mantenha por 30 segundos e retorne à posição inicial",
          ],
          sets: 3,
          duration_seconds: 30,
          rest_seconds: 45,
          thumbnail_url: T2,
          difficulty: 2,
          session_phase: "active",
          body_region: "core",
        },
        {
          id: "ex_agachamento",
          name: "Médio Agachamento (até 60°)",
          description: "Fortalece toda a cadeia do membro inferior com flexão limitada a 60°.",
          instructions: [
            "Em pé, com os braços direcionados para frente, realize o agachamento",
            "A flexão do joelho não deve ultrapassar 60° — segure 10 segundos em cada repetição",
            "Não deixe o joelho ir para dentro; faça de frente para um espelho",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_corrida_leve",
          name: "Corrida Leve",
          description: "A partir da 10ª semana — reintroduz impacto de forma progressiva.",
          instructions: [
            "Corra em linha reta na esteira ou em terreno plano por 15 minutos",
            "Aterrissagem suave, ritmo leve e controlado",
            "IMPORTANTE: se houver dor, inchaço ou instabilidade, pare e avise seu fisioterapeuta",
          ],
          duration_seconds: 900,
          rest_seconds: 90,
          thumbnail_url: T3,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_saltos",
          name: "Saltos (Duas Pernas)",
          description: "Prepara o joelho para atividades de impacto.",
          instructions: [
            "Em pé, realize saltos com apoio das duas pernas",
            "Procure aterrissar com a parte do meio do pé",
            "Não deixe os joelhos irem para dentro na aterrissagem",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_equilibrio_unipodal",
          name: "Apoio Unipodal (Dupla Função)",
          description: "Propriocepção e estabilidade — essencial para evitar nova lesão.",
          instructions: [
            "Fique em apoio de um pé",
            "Segure um objeto de 2 a 3 kg e passe de uma mão para a outra, fazendo círculos ao redor de si",
            "Atenção para não deixar o joelho ir para dentro",
          ],
          duration_seconds: 30,
          sets: 3,
          rest_seconds: 30,
          thumbnail_url: T2,
          difficulty: 2,
          session_phase: "active",
          body_region: "joelho",
        },
      ],
    },
    {
      id: "lca_phase_4",
      phase_number: 4,
      name: "Retorno Funcional",
      duration_weeks: 8,
      sessions_per_week: 3,
      focus:
        "Semanas 17–24 · Movimentos esportivos (corte, chute e giro) e preparação para o retorno ao esporte",
      doctor_message:
        "Você chegou à fase final. Sua musculatura está forte e estável. Está muito perto do seu objetivo.",
      exercises: [
        {
          id: "ex_marcha_lateral",
          name: "Marcha Lateral Cruzada",
          description: "Coordenação e agilidade em deslocamento lateral.",
          instructions: [
            "Realize marcha lateral cruzando as pernas (uma à frente, depois por trás da outra)",
            "Estabeleça uma marcação de 3 metros e percorra ida e volta",
            "Faça 3 séries do percurso",
          ],
          sets: 3,
          reps: 1,
          rest_seconds: 45,
          thumbnail_url: T3,
          difficulty: 2,
          session_phase: "warmup",
          body_region: "joelho",
        },
        {
          id: "ex_afundo",
          name: "Avanço / Afundo",
          description: "Movimento funcional que testa força e estabilidade em assimetria.",
          instructions: [
            "Em pé, com os braços para frente, coloque uma perna à frente e realize um agachamento",
            "Volte à posição inicial e repita com a outra perna",
            "Mantenha os joelhos alinhados; faça de frente para um espelho",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 3,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_salto_unipodal",
          name: "Salto Unipodal (Um Pé)",
          description: "Marco de potência e confiança no joelho operado.",
          instructions: [
            "Em pé, realize saltos com apoio de um pé — inicie com a perna operada",
            "Procure aterrissar com a parte do meio do pé",
            "Não deixe o joelho ir para dentro na aterrissagem",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 3,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_agachamento_unipodal",
          name: "Agachamento com Carga (5 kg)",
          description: "Força máxima com carga — flexão limitada a 60°.",
          instructions: [
            "Use uma mochila com 5 kg; realize o agachamento e fique na posição por 10 segundos",
            "A flexão do joelho não deve ultrapassar 60°",
            "Não deixe os joelhos irem para dentro; faça de frente para um espelho",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 90,
          thumbnail_url: T2,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_tiro",
          name: "Corrida Curta (Tiro)",
          description: "Aceleração e desaceleração — preparação direta para o esporte.",
          instructions: [
            "Realize corrida curta de 3 metros",
            "Desacelere a ponto de parar apoiado em uma perna",
            "Faça 10 tiros; se houver dor, inchaço ou instabilidade, pare e avise seu fisioterapeuta",
          ],
          sets: 1,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T3,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_corrida_oito",
          name: "Corrida em Oito",
          description: "Mudança de direção controlada entre cones.",
          instructions: [
            "Estabeleça 10 metros de distância entre dois cones",
            "Realize corrida em formato de oito ao redor dos cones",
            "Faça 5 séries de 30 segundos",
          ],
          sets: 5,
          duration_seconds: 30,
          rest_seconds: 60,
          thumbnail_url: T3,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_movimentos_esportivos",
          name: "Movimentos Esportivos",
          description: "Corte, chute e giro — os gestos do seu esporte, de volta com segurança.",
          instructions: [
            "Treine os movimentos realizados na sua prática esportiva: corte, chute e giro",
            "Comece em velocidade reduzida e aumente progressivamente",
            "Retorno ao esporte somente após 6 meses e com liberação médica",
          ],
          sets: 3,
          duration_seconds: 60,
          rest_seconds: 90,
          thumbnail_url: T1,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
      ],
    },
  ],
};

export const PROTOCOL_MENISCUS: Protocol = {
  id: "proto_meniscus",
  injury_type: "meniscus",
  name: "Recuperação de Lesão de Menisco",
  total_weeks: 14,
  sessions_per_week: 3,
  phases: [
    {
      id: "men_phase_1",
      phase_number: 1,
      name: "Pós-operatório Imediato",
      duration_weeks: 2,
      sessions_per_week: 3,
      focus: "Controle de dor, edema e manutenção muscular mínima",
      doctor_message:
        "Ótima recuperação inicial. Na próxima fase vamos focar em mobilidade completa.",
      exercises: [
        {
          id: "ex_quad_iso_men",
          name: "Contração Isométrica do Quadríceps",
          description: "Mantém tônus muscular sem carga articular.",
          instructions: [
            "Sente-se com a perna estendida sobre superfície plana",
            "Contraia o músculo da coxa pressionando o joelho para baixo",
            "Mantenha 5 segundos e relaxe completamente",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 30,
          thumbnail_url: T1,
          difficulty: 1,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_glut_bridge_men",
          name: "Ponte de Glúteo",
          description: "Fortalece glúteos e posterior sem carga no joelho.",
          instructions: [
            "Deite com os joelhos dobrados e pés apoiados no chão",
            "Eleve o quadril formando linha reta ombro–quadril–joelho",
            "Contraia o glúteo no topo por 2 segundos antes de descer",
          ],
          sets: 3,
          reps: 12,
          rest_seconds: 45,
          thumbnail_url: T2,
          difficulty: 1,
          session_phase: "active",
          body_region: "quadril",
        },
        {
          id: "ex_slr_men",
          name: "Elevação do Membro Estendido",
          description: "Ativa quadríceps sem pressão no menisco.",
          instructions: [
            "Deite de costas com a perna operada estendida",
            "Eleve a perna até 45° devagar",
            "Desça em 3 segundos — controle é fundamental",
          ],
          sets: 3,
          reps: 12,
          rest_seconds: 45,
          thumbnail_url: T3,
          difficulty: 1,
          session_phase: "active",
          body_region: "quadril",
        },
      ],
    },
    {
      id: "men_phase_2",
      phase_number: 2,
      name: "Restauração de Mobilidade",
      duration_weeks: 4,
      sessions_per_week: 4,
      focus: "Recuperar amplitude completa e iniciar exercícios em pé",
      doctor_message: "Excelente progresso. Nas próximas semanas o foco é fortalecimento.",
      exercises: [
        {
          id: "ex_bike_men",
          name: "Bicicleta Estacionária Leve",
          description: "Melhora mobilidade e circulação sem impacto.",
          instructions: [
            "Ajuste o selim alto o suficiente para não forçar o joelho",
            "Pedaladas leves sem resistência por 10 a 15 minutos",
            "Pare se sentir dor ou crepitação",
          ],
          duration_seconds: 600,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 1,
          session_phase: "warmup",
          body_region: "joelho",
        },
        {
          id: "ex_flex_ativa_men",
          name: "Flexão Ativa do Joelho",
          description: "Recupera amplitude de flexão articular progressivamente.",
          instructions: [
            "Sente-se na beira da cama com as pernas pendentes",
            "Dobre o joelho operado devagar até resistência moderada",
            "Nunca force se sentir dor aguda",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 45,
          thumbnail_url: T2,
          difficulty: 2,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_mini_squat_men",
          name: "Mini Agachamento Bilateral",
          description: "Inicia carga em pé com controle articular.",
          instructions: [
            "Fique em pé com apoio e pés na largura do quadril",
            "Dobre os joelhos 20-30° apenas",
            "Mantenha joelhos alinhados com os pés",
          ],
          sets: 3,
          reps: 12,
          rest_seconds: 60,
          thumbnail_url: T3,
          difficulty: 2,
          session_phase: "peak",
          body_region: "joelho",
        },
      ],
    },
    {
      id: "men_phase_3",
      phase_number: 3,
      name: "Fortalecimento e Retorno",
      duration_weeks: 8,
      sessions_per_week: 3,
      focus: "Força funcional e retorno às atividades cotidianas e esportivas",
      doctor_message: "Sua recuperação foi excelente. Retorne às atividades com confiança.",
      exercises: [
        {
          id: "ex_agach_men",
          name: "Agachamento Completo",
          description: "Fortalecimento bilateral em amplitude completa.",
          instructions: [
            "Pés na largura dos ombros, dedos ligeiramente abertos",
            "Desça até 90° mantendo o tronco reto",
            "Suba empurrando o chão",
          ],
          sets: 4,
          reps: 12,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_equilibrio_men",
          name: "Equilíbrio Unipodal Progressivo",
          description: "Restaura propriocepção e confiança.",
          instructions: [
            "Equilíbrio na perna operada com olhos abertos por 30s",
            "Avance para olhos fechados quando sentir segurança",
            "Tenha sempre apoio próximo",
          ],
          duration_seconds: 30,
          sets: 3,
          rest_seconds: 30,
          thumbnail_url: T2,
          difficulty: 2,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_afundo_men",
          name: "Afundo Frontal",
          description: "Teste final de força e estabilidade funcional.",
          instructions: [
            "Passo longo à frente com a perna operada",
            "Joelho da frente forma 90° — não ultrapassa o pé",
            "Empurre o chão com força para voltar",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T3,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
      ],
    },
  ],
};

export const PROTOCOL_PATELLOFEMORAL: Protocol = {
  id: "proto_patellofemoral",
  injury_type: "patellofemoral",
  name: "Tratamento da Síndrome Patelofemoral",
  total_weeks: 12,
  sessions_per_week: 3,
  phases: [
    {
      id: "pat_phase_1",
      phase_number: 1,
      name: "Controle da Inflamação",
      duration_weeks: 3,
      sessions_per_week: 3,
      focus: "Reduzir inflamação, ativar VMO e corrigir padrão de ativação",
      doctor_message: "Inflamação sob controle. Próxima fase: fortalecimento.",
      exercises: [
        {
          id: "ex_vmo_activation",
          name: "Ativação do VMO",
          description: "Ativa o Vasto Medial Oblíquo — crítico para alinhamento patelar.",
          instructions: [
            "Sente-se com a perna levemente dobrada (15–20°)",
            "Dedos no músculo interno da coxa acima do joelho",
            "Contraia sentindo o VMO firmar — não o quadríceps todo",
          ],
          sets: 3,
          reps: 20,
          rest_seconds: 30,
          thumbnail_url: T1,
          difficulty: 1,
          session_phase: "active",
          body_region: "joelho",
        },
        {
          id: "ex_alongamento_itb",
          name: "Alongamento de IT Band",
          description: "Alivia tensão lateral que traciona a pátela.",
          instructions: [
            "Em pé, cruze a perna sintomática atrás da outra",
            "Incline o tronco para o lado oposto",
            "Mantenha 30 segundos",
          ],
          duration_seconds: 30,
          sets: 3,
          rest_seconds: 20,
          thumbnail_url: T2,
          difficulty: 1,
          session_phase: "rest",
          body_region: "joelho",
        },
        {
          id: "ex_abducao_pat",
          name: "Fortalecimento de Abdutores do Quadril",
          description: "Reduz sobrecarga patelar por mau alinhamento.",
          instructions: [
            "Deite de lado com a perna sintomática por cima",
            "Eleve a perna 30 cm com o pé neutro",
            "Desça em 3 segundos controlados",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 30,
          thumbnail_url: T3,
          difficulty: 1,
          session_phase: "active",
          body_region: "quadril",
        },
      ],
    },
    {
      id: "pat_phase_2",
      phase_number: 2,
      name: "Fortalecimento do Quadríceps",
      duration_weeks: 5,
      sessions_per_week: 4,
      focus: "Hipertrofia de quadríceps e glúteos com controle patelar",
      doctor_message: "Quadríceps fortalecendo e alinhamento melhorando. Mantenha a qualidade.",
      exercises: [
        {
          id: "ex_step_down",
          name: "Descida de Degrau Controlada",
          description: "Exercício excêntrico de alta eficácia para síndrome patelofemoral.",
          instructions: [
            "Em cima de um degrau baixo (10 cm) na perna sintomática",
            "Desça o pé oposto devagar — 5 segundos",
            "Suba usando apenas a perna no degrau",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 2,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_agach_parede",
          name: "Wall Squat Isométrico",
          description: "Fortalece quadríceps e glúteos sem impacto.",
          instructions: [
            "Costas na parede, deslize até os joelhos formarem 90°",
            "Pés na largura dos ombros, joelhos alinhados",
            "Mantenha respirando normalmente",
          ],
          duration_seconds: 30,
          sets: 3,
          rest_seconds: 60,
          thumbnail_url: T2,
          difficulty: 2,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_glut_bridge_pat",
          name: "Ponte de Glúteo com Resistência",
          description: "Fortalece glúteos e corrige valgo dinâmico do joelho.",
          instructions: [
            "Joelhos dobrados, elástico acima dos joelhos",
            "Eleve o quadril e empurre o elástico para fora",
            "Mantenha 2 segundos no topo",
          ],
          sets: 3,
          reps: 15,
          rest_seconds: 45,
          thumbnail_url: T3,
          difficulty: 2,
          session_phase: "active",
          body_region: "quadril",
        },
      ],
    },
    {
      id: "pat_phase_3",
      phase_number: 3,
      name: "Retorno Funcional",
      duration_weeks: 4,
      sessions_per_week: 3,
      focus: "Retorno às atividades cotidianas e esportivas sem dor",
      doctor_message: "Joelho forte e estável. Continue com exercícios de manutenção.",
      exercises: [
        {
          id: "ex_agach_completo_pat",
          name: "Agachamento Completo",
          description: "Teste de retorno funcional — sem dor.",
          instructions: [
            "Pés na largura dos ombros com controle do alinhamento",
            "Desça até 90° mantendo joelhos sobre os pés",
            "Suba empurrando com os calcanhares",
          ],
          sets: 4,
          reps: 15,
          rest_seconds: 60,
          thumbnail_url: T1,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
        {
          id: "ex_afundo_lateral",
          name: "Afundo Lateral",
          description: "Força em plano frontal — essencial para esportes.",
          instructions: [
            "Afundo lateral — um pé permanece no centro",
            "Joelho que dobra alinhado com o pé",
            "Empurre o chão para retornar ao centro",
          ],
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          thumbnail_url: T2,
          difficulty: 3,
          session_phase: "peak",
          body_region: "joelho",
        },
      ],
    },
  ],
};

export const PROTOCOLS: Record<string, Protocol> = {
  proto_lca: PROTOCOL_LCA,
  proto_meniscus: PROTOCOL_MENISCUS,
  proto_patellofemoral: PROTOCOL_PATELLOFEMORAL,
};

/**
 * Foto do item, por região do corpo.
 *
 * Substitui um laço que, no import do módulo, **mutava os 43 exercícios** e
 * sobrescrevia qualquer `thumbnail_url` explícito — o que tornava impossível
 * dar foto própria a um item e fazia o protocolo mudar de forma como efeito
 * colateral de carregar o arquivo. Puro: quem tem foto própria a mantém.
 */
export function thumbnailFor(ex: Pick<Exercise, "thumbnail_url" | "body_region">): string {
  return ex.thumbnail_url ?? THUMB_BY_REGION[ex.body_region] ?? thumbJoelho;
}

// Protocolos pós-cirúrgicos derivam toda a progressão da data da cirurgia, então
// o campo é obrigatório no onboarding deles. Patelofemoral é tratamento
// conservador — não há cirurgia, e o fallback continua sendo `started_at`.
export const REQUIRES_SURGERY_DATE: Record<InjuryType, boolean> = {
  lca: true,
  meniscus: true,
  patellofemoral: false,
};

export function getProtocol(id: string): Protocol {
  return PROTOCOLS[id] ?? PROTOCOL_LCA;
}

// `totalSessionsForProtocol` mudou de casa: agora soma semana a semana e vive
// em `lib/prescription.ts`, junto do resto da derivação por semana pós-op. A
// versão que morava aqui multiplicava `duration_weeks × sessions_per_week` por
// fase e passou a estar errada quando a semana 1 virou diária.
//
// `weekForCompletedSessions` foi DELETADA. Ela inferia a semana a partir das
// sessões concluídas, o que fazia o paciente que faltou uma semana "voltar no
// tempo" — a semana é função da data da cirurgia. Use `postOpWeekOf`.

// Bloco do guia clínico (cartilha) correspondente a uma semana pós-op.
export function getWeekGuide(p: Protocol, week: number): WeekGuideEntry | undefined {
  return p.clinical_guide?.weeks.find((w) => week >= w.week_start && week <= w.week_end);
}
