import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import { usePatientStore } from "@/store/patient";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const hydrated = useHydratedStore();
  const isOnboarded = usePatientStore((s) => s.isOnboarded);
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !isOnboarded) {
      navigate({ to: "/welcome" });
    }
  }, [hydrated, isOnboarded, navigate]);

  return (
    <MobileFrame>
      {hydrated ? (
        <Outlet />
      ) : (
        <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
          Carregando…
        </div>
      )}
      <BottomNav />
    </MobileFrame>
  );
}