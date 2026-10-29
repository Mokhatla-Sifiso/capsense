"use client";

import type { MouseEvent, ReactNode } from "react";

export const MAIN_ID = "main";

function skipToMain(event: MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault();
  document.getElementById(MAIN_ID)?.focus();
}

export function SkipLink(): ReactNode {
  return (
    <a
      href={`#${MAIN_ID}`}
      onClick={skipToMain}
      className="fixed top-3 left-3 z-50 inline-flex min-h-11 -translate-y-[200%] items-center rounded-pill bg-card px-5 font-semibold text-primary shadow-card focus:translate-y-0"
    >
      Skip to main content
    </a>
  );
}
