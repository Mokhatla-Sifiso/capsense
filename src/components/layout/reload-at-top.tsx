"use client";

import { useEffect } from "react";

const CUSTOMER_INPUT = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

function wasReloaded(): boolean {
  const [entry] = performance.getEntriesByType("navigation");
  return entry instanceof PerformanceNavigationTiming && entry.type === "reload";
}

function toTop(): void {
  if (window.scrollY !== 0) window.scrollTo(0, 0);
}

export function ReloadAtTop(): null {
  useEffect(() => {
    if (!wasReloaded()) return;
    history.scrollRestoration = "manual";
    toTop();
    const handBack = (): void => {
      history.scrollRestoration = "auto";
      window.removeEventListener("scroll", toTop);
      for (const input of CUSTOMER_INPUT) window.removeEventListener(input, handBack);
    };
    window.addEventListener("scroll", toTop, { passive: true });
    for (const input of CUSTOMER_INPUT) window.addEventListener(input, handBack, { passive: true });
    return handBack;
  }, []);
  return null;
}
