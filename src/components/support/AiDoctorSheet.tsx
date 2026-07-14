import { useState } from "react";
import { Stethoscope, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AiDoctorChat } from "./AiDoctorChat";
import aiDoctor from "@/assets/ai-doctor.jpg";

export function AiDoctorFab() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Abrir AI Doctor"
          className="fixed bottom-36 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-white/80 transition hover:scale-105"
        >
          <img
            src={aiDoctor}
            alt=""
            className="absolute inset-0 h-full w-full rounded-full object-cover opacity-90"
          />
          <span className="absolute inset-0 rounded-full bg-primary/40" />
          <Stethoscope className="relative h-6 w-6 drop-shadow" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-[10px] font-bold text-white ring-2 ring-card">
            AI
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[88vh] rounded-t-3xl border-0 p-0">
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-3 text-left">
          <div className="flex items-center gap-3">
            <img
              src={aiDoctor}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/30"
            />
            <div>
              <SheetTitle className="text-base">AI Doctor</SheetTitle>
              <p className="text-[11px] text-muted-foreground">
                Tire dúvidas sem sair do exercício
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>
        <div className="h-[calc(88vh-72px)] overflow-hidden px-3 pb-3 pt-3">
          <AiDoctorChat className="h-full min-h-0 rounded-xl" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
