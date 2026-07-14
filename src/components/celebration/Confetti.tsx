import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return;
    const defaults = { spread: 70, ticks: 80, gravity: 0.8, decay: 0.94, startVelocity: 35 };
    confetti({ ...defaults, particleCount: 60, origin: { x: 0.2, y: 0.6 } });
    confetti({ ...defaults, particleCount: 60, origin: { x: 0.8, y: 0.6 } });
    confetti({ ...defaults, particleCount: 80, origin: { x: 0.5, y: 0.4 } });
  }, [trigger]);
  return null;
}
