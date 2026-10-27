"use client";

import { type ReactNode, useEffect, useId, useState } from "react";

interface GreetingTooltipProps {
  greeting: string;
  description: string;
}

export function GreetingTooltip({ greeting, description }: GreetingTooltipProps): ReactNode {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="rounded-6"
      >
        {greeting}
      </span>
      <span id={tooltipId} role="tooltip" hidden={!open} className="absolute top-full left-0 z-10 pt-2">
        <span className="block w-max max-w-65 rounded-10 border border-border bg-card px-2.5 py-1.5 text-xs font-normal tracking-normal text-muted-foreground shadow-tooltip md:max-w-none">
          {description}
        </span>
      </span>
    </span>
  );
}
