"use client";

import { type ReactNode, useEffect, useState } from "react";

export const STILL_LOADING_MS = 5_000;

export function useStillLoading(pending: boolean): boolean {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setSlow(true), STILL_LOADING_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [pending]);

  return pending && slow;
}

export function StillLoading({ pending }: { pending: boolean }): ReactNode {
  const slow = useStillLoading(pending);
  return (
    <p role="status" className={`text-sm font-semibold text-muted-foreground ${slow ? "mt-3" : ""}`}>
      {slow ? "Still loading…" : null}
    </p>
  );
}
