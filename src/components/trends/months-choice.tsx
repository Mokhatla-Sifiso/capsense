"use client";

import type { ReactNode } from "react";
import { MONTH_OPTIONS, isMonthOption } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";

export function MonthsChoice({ caretIcon }: { caretIcon: ReactNode }): ReactNode {
  const [params, setParams] = useDashboardParams();

  return (
    <div className="relative w-32 shrink-0">
      <select
        aria-label="Months"
        value={params.months}
        onChange={(event) => {
          const months = Number(event.target.value);
          if (isMonthOption(months)) void setParams({ months });
        }}
        className="min-h-12 w-full appearance-none rounded-12 border border-input bg-card pr-9 pl-4 text-sm font-semibold text-foreground lg:min-h-10"
      >
        {MONTH_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option} months
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2">{caretIcon}</span>
    </div>
  );
}
