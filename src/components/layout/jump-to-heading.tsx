"use client";

import type { ReactNode } from "react";

interface JumpToHeadingProps {
  headingId: string;
  className: string;
  children: ReactNode;
}

export function JumpToHeading({ headingId, className, children }: JumpToHeadingProps): ReactNode {
  return (
    <button type="button" onClick={() => document.getElementById(headingId)?.focus()} className={className}>
      {children}
    </button>
  );
}
