import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Centered mobile-width frame for desktop preview; full-width on phones. */
export function MobileFrame({
  children,
  className,
  withNav = true,
}: {
  children: ReactNode;
  className?: string;
  withNav?: boolean;
}) {
  return (
    <div className="min-h-screen bg-bg-subtle">
      <div
        className={cn(
          "mx-auto min-h-screen max-w-md bg-background shadow-sm",
          withNav && "pb-24",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
