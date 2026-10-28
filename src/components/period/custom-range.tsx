"use client";

import { type FormEvent, type ReactNode, useId, useState } from "react";
import { Dialog } from "@/components/dialog/dialog";
import { MAX_RANGE_DAYS, rangeProblem } from "@/lib/custom-range";
import { formatDay } from "@/lib/format";
import { customRange } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";

interface CustomRangeProps {
  today: string;
  calendarIcon: ReactNode;
  problemIcon: ReactNode;
}

interface DateFieldProps {
  label: string;
  value: string;
  max: string;
  problemId: string | undefined;
  onChange: (value: string) => void;
}

const OPENER =
  "flex min-h-12 w-full items-center justify-center gap-2 rounded-pill px-5 font-semibold whitespace-nowrap shadow-card transition-colors md:w-auto lg:min-h-11";
const ACTION = "min-h-12 rounded-pill px-6 font-semibold lg:min-h-11";

function DateField({ label, value, max, problemId, onChange }: DateFieldProps): ReactNode {
  const id = useId();
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        max={max}
        aria-invalid={problemId ? true : undefined}
        aria-describedby={problemId}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-icon-button border border-input bg-card px-4 text-foreground"
      />
    </div>
  );
}

export function CustomRange({ today, calendarIcon, problemIcon }: CustomRangeProps): ReactNode {
  const [params, setParams] = useDashboardParams();
  const applied = customRange(params);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const problemId = useId();
  const dates = applied && `${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`;

  function open(): void {
    setFrom(applied?.startDate ?? "");
    setTo(applied?.endDate ?? "");
    setProblem(null);
  }

  function apply(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const found = rangeProblem(from, to, today);
    setProblem(found);
    if (found) return;
    void setParams({ period: null, startDate: from, endDate: to, page: null });
    event.currentTarget.closest("dialog")?.close();
  }

  return (
    <Dialog
      title="Custom range"
      trigger={
        <>
          {calendarIcon}
          {dates ? `Custom: ${dates}` : "Custom range"}
        </>
      }
      triggerLabel={dates ? `Custom range: ${dates}` : undefined}
      triggerClassName={`${OPENER} ${applied ? "bg-primary text-primary-foreground" : "bg-card text-primary"}`}
      onOpen={open}
    >
      <form noValidate onSubmit={apply}>
        <p className="text-muted-foreground">
          Dates up to {formatDay(today)}, a range of {MAX_RANGE_DAYS} days or fewer.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <DateField
            label="From"
            value={from}
            max={today}
            problemId={problem ? problemId : undefined}
            onChange={setFrom}
          />
          <DateField label="To" value={to} max={today} problemId={problem ? problemId : undefined} onChange={setTo} />
        </div>
        {problem && (
          <p id={problemId} role="alert" className="mt-4 flex items-start gap-2 font-semibold text-danger-text">
            <span className="mt-0.5 shrink-0">{problemIcon}</span>
            {problem}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={(event) => event.currentTarget.closest("dialog")?.close()}
            className={`${ACTION} border border-primary text-primary`}
          >
            Cancel
          </button>
          <button type="submit" className={`${ACTION} bg-primary text-primary-foreground`}>
            Apply
          </button>
        </div>
      </form>
    </Dialog>
  );
}
