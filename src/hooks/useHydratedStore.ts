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
    let mounted = true;
    void Promise.resolve(usePatientStore.persist.rehydrate()).finally(() => {
      if (mounted) setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return hydrated;
}