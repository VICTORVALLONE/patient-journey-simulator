import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { ChevronDown, MessageCircle, Phone, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AiDoctorChat } from "@/components/support/AiDoctorChat";
import aiDoctorAvatar from "@/assets/ai-doctor.jpg";

export const Route = createFileRoute("/_app/support")({
  head: () => ({ meta: [{ title: "Suporte · FisioApp" }] }),
  component: SupportPage,
});

const FAQ = [
  {
    q: "Posso fazer os exercícios sem assistir o vídeo?",
    a: "Sim. Toda instrução tem texto numerado em destaque para que o exercício possa ser executado sem internet ou em dados limitados. O vídeo é um reforço — não um pré-requisito.",
  },
  {
    q: "E se eu sentir dor durante o exercício?",
    a: "Pare imediatamente, marque ‘Tive dificuldade’ e ajuste a intensidade. Dor leve durante o esforço é normal; dor aguda ou que persiste após o exercício deve ser comunicada ao seu médico.",
  },
  {
    q: "Posso pular uma sessão?",
    a: "Idealmente não. Estudos mostram que adesão consistente é o principal fator de sucesso. Se faltar, retome assim que possível — não tente compensar com sessões dobradas.",
  },
  {
    q: "Em quanto tempo verei resultados?",
    a: "A maioria dos pacientes nota redução de dor entre a 3ª e a 4ª semana. Mobilidade volta junto. Força leva mais tempo — siga o protocolo completo.",
  },
  {
    q: "Posso trocar o horário do lembrete?",
    a: "Sim, no seu perfil em Configurações > Notificações. (Notificações ainda não estão ativas neste MVP.)",
  },
];

function SupportPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="px-5 pt-6 pb-4">
      <header className="flex items-center gap-3">
        <img
          src={aiDoctorAvatar}
          alt="AI Doctor"
          loading="lazy"
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
        />
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-foreground">AI Doctor</h1>
            <span className="rounded-full bg-primary-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-dark">
              <Sparkles className="mr-0.5 inline h-2.5 w-2.5" /> Beta
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Tire dúvidas sobre seu tratamento, 24/7.</p>
        </div>
      </header>

      <section className="mt-5">
        <ClientOnly
          fallback={
            <div className="h-[70vh] min-h-[460px] rounded-2xl border border-border bg-card" />
          }
        >
          <AiDoctorChat />
        </ClientOnly>
      </section>

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Outras formas de ajuda
        </p>
        <div className="mt-2 space-y-2">
          <a
            href="https://wa.me/5511999990000?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20no%20FisioApp"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="rounded-xl bg-success/15 p-2 text-success">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Atendimento humano em horário comercial
              </p>
            </div>
          </a>

          <a
            href="tel:+551130000000"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="rounded-xl bg-primary-muted p-2 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Ligar para o suporte</p>
              <p className="text-xs text-muted-foreground">Seg a Sex · 9h–18h</p>
            </div>
          </a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Perguntas frequentes</h2>
        <div className="mt-3 space-y-2">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl border border-border bg-card">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 mb-4 rounded-2xl bg-bg-subtle p-4">
        <p className="text-xs text-muted-foreground">
          Atendimento clínico continua sendo realizado pelo seu médico. O FisioApp apoia a adesão ao
          protocolo prescrito — não substitui consulta presencial.
        </p>
      </section>
    </div>
  );
}
