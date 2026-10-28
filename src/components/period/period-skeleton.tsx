import type { ReactNode } from "react";
import { PERIODS } from "@/schemas/api";

export const PERIOD_ROW = "flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center";

export function PresetSkeleton(): ReactNode {
  return (
    <>
      <span aria-hidden className="h-12 w-full animate-pulse rounded-pill bg-skeleton md:hidden" />
      <span aria-hidden className="hidden gap-1 rounded-pill bg-card p-1 shadow-card md:flex">
        {PERIODS.map((period) => (
          <span key={period} className="h-11 w-26 animate-pulse rounded-pill bg-skeleton lg:h-9" />
        ))}
      </span>
    </>
  );
}

export function PeriodSkeleton(): ReactNode {
  return (
    <div className={PERIOD_ROW}>
      <PresetSkeleton />
      <span aria-hidden className="h-12 w-full animate-pulse rounded-pill bg-skeleton md:w-44 lg:h-11" />
    </div>
  );
}
