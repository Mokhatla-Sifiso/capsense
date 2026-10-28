import type { ReactNode } from "react";

export const SUMMARY_HEIGHT = "min-h-84.5 md:min-h-71 lg:min-h-75.5 xl:min-h-71";

export function SummarySkeleton(): ReactNode {
  return (
    <section
      aria-label="Spending summary"
      aria-busy="true"
      className={`animate-pulse rounded-hero bg-skeleton ${SUMMARY_HEIGHT}`}
    />
  );
}
