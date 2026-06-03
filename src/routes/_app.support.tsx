import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/support")({
  head: () => ({ meta: [{ title: "Suporte · FisioCare" }] }),
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
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold text-foreground">Suporte</h1>
      <p className="text-sm text-muted-foreground">Estamos aqui para te ajudar.</p>

      <section className="mt-6 space-y-3">
        <a
          href="https://wa.me/5511999990000?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20no%20FisioCare"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="rounded-xl bg-success/15 p-2 text-success">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">WhatsApp</p>
            <p className="text-xs text-muted-foreground">Resposta em até 1h em horário comercial</p>
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
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 mb-4 rounded-2xl bg-bg-subtle p-4">
        <p className="text-xs text-muted-foreground">
          Atendimento clínico continua sendo realizado pelo seu médico. O FisioCare apoia a adesão
          ao protocolo prescrito — não substitui consulta presencial.
        </p>
      </section>
    </div>
  );
}