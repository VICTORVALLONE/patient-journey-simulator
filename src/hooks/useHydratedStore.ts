import { useEffect, useState } from "react";
import { usePatientStore } from "@/store/patient";

/**
 * Triggers Zustand persist rehydration on the client and returns whether
 * hydration has finished. Use to gate any UI that reads patient state so
 * we never render mismatched SSR content.
 */
export function useHydratedStore(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void usePatientStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}