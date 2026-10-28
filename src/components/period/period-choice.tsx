"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useId } from "react";
import { formatDay } from "@/lib/format";
import { isPeriod, periodOptions } from "@/lib/period-options";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { customRange } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";
import type { Period } from "@/schemas/api";
import { PERIOD_ROW, PresetSkeleton } from "./period-skeleton";

interface PeriodChoiceProps {
  checkIcon: ReactNode;
  caretIcon: ReactNode;
  calendarIcon: ReactNode;
}

const SEGMENT =
  "flex min-h-11 cursor-pointer items-center gap-1.5 rounded-pill px-4 text-control whitespace-nowrap transition-colors lg:min-h-9 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring";
const SELECTED = "bg-spend font-bold text-spend-fg dark:bg-primary dark:text-primary-foreground";
const UNSELECTED = "font-semibold text-foreground hover:bg-soft";
const CUSTOM_BUTTON =
  "flex min-h-12 w-full items-center justify-center gap-2 rounded-pill px-5 font-semibold whitespace-nowrap shadow-card transition-colors md:w-auto lg:min-h-11";

export function PeriodChoice({ checkIcon, caretIcon, calendarIcon }: PeriodChoiceProps): ReactNode {
  const [params, setParams] = useDashboardParams();
  const filters = useQuery(dashboardQueries.filters());
  const group = useId();
  const options = periodOptions(filters.data?.dateRangePresets);
  const custom = customRange(params);
  const answered = useQuery({
    ...dashboardQueries.summary(params.period),
    enabled: !custom,
    select: (summary) => summary.period,
  });
  const selected = custom ? "" : (answered.data ?? params.period);
  const customDates = custom && `${formatDay(custom.startDate)} – ${formatDay(custom.endDate)}`;

  function choose(period: Period): void {
    void setParams({ period, startDate: null, endDate: null, page: null });
  }

  return (
    <div className={PERIOD_ROW}>
      {filters.isPending ? (
        <PresetSkeleton />
      ) : (
        <>
          <div className="relative md:hidden">
            <select
              aria-label="Period"
              value={selected}
              onChange={(event) => isPeriod(event.target.value) && choose(event.target.value)}
              className="min-h-12 w-full appearance-none rounded-pill border border-input bg-card pr-12 pl-5 text-sm font-semibold text-foreground"
            >
              {custom && (
                <option value="" disabled>
                  Custom range
                </option>
              )}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2">{caretIcon}</span>
          </div>

          <div
            role="radiogroup"
            aria-label="Period"
            className="hidden gap-1 rounded-pill bg-card p-1 shadow-card md:flex"
          >
            {options.map((option) => (
              <label key={option.value} className={`${SEGMENT} ${selected === option.value ? SELECTED : UNSELECTED}`}>
                <input
                  type="radio"
                  name={group}
                  value={option.value}
                  checked={selected === option.value}
                  onChange={() => choose(option.value)}
                  className="sr-only"
                />
                {selected === option.value && checkIcon}
                {option.label}
              </label>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        aria-label={customDates ? `Custom range: ${customDates}` : undefined}
        className={`${CUSTOM_BUTTON} ${custom ? "bg-primary text-primary-foreground" : "bg-card text-primary"}`}
      >
        {calendarIcon}
        {customDates ? `Custom: ${customDates}` : "Custom range"}
      </button>
    </div>
  );
}
