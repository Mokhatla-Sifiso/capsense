"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { formatDay } from "@/lib/format";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { customRange } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";
import { SORT_ORDERS, type SortOrder } from "@/schemas/api";

interface TransactionFiltersProps {
  caretIcon: ReactNode;
  datesOpener: ReactNode;
}

interface FilterLabelsProps {
  removeIcon: ReactNode;
}

const SORT_LABELS: Record<SortOrder, string> = {
  date_desc: "Newest first",
  date_asc: "Oldest first",
  amount_desc: "Amount: high to low",
  amount_asc: "Amount: low to high",
};

const SELECT =
  "min-h-12 w-full appearance-none rounded-pill border border-input bg-card pr-12 pl-5 font-semibold text-foreground lg:min-h-11";

function isSortOrder(value: string): value is SortOrder {
  return (SORT_ORDERS as readonly string[]).includes(value);
}

function focusTransactions(): void {
  document.getElementById("transactions-heading")?.focus();
}

function Choice({ caretIcon, children }: { caretIcon: ReactNode; children: ReactNode }): ReactNode {
  return (
    <div className="relative md:w-52">
      {children}
      <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2">{caretIcon}</span>
    </div>
  );
}

export function TransactionFilters({ caretIcon, datesOpener }: TransactionFiltersProps): ReactNode {
  const [params, setParams] = useDashboardParams();
  const filters = useQuery(dashboardQueries.filters());
  const categories = filters.data?.categories ?? [];

  return (
    <div role="group" aria-label="Transaction filters" className="grid gap-3 md:flex md:flex-wrap md:justify-end">
      {categories.length > 0 && (
        <Choice caretIcon={caretIcon}>
          <select
            aria-label="Category"
            value={params.category ?? ""}
            onChange={(event) => void setParams({ category: event.target.value || null, page: null })}
            className={SELECT}
          >
            <option value="">All categories</option>
            {categories.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Choice>
      )}
      <Choice caretIcon={caretIcon}>
        <select
          aria-label="Sort"
          value={params.sort}
          onChange={(event) =>
            isSortOrder(event.target.value) && void setParams({ sort: event.target.value, page: null })
          }
          className={SELECT}
        >
          {SORT_ORDERS.map((order) => (
            <option key={order} value={order}>
              {SORT_LABELS[order]}
            </option>
          ))}
        </select>
      </Choice>
      {datesOpener}
    </div>
  );
}

export function useClearFilters(): { filtered: boolean; clear: () => void } {
  const [params, setParams] = useDashboardParams();
  const filtered = params.category !== null || customRange(params) !== null;
  function clear(): void {
    void setParams({ category: null, startDate: null, endDate: null, page: null });
    focusTransactions();
  }
  return { filtered, clear };
}

export function FilterLabels({ removeIcon }: FilterLabelsProps): ReactNode {
  const [params, setParams] = useDashboardParams();
  const { filtered, clear } = useClearFilters();
  const range = customRange(params);
  if (!filtered) return null;

  function removeCategory(): void {
    void setParams({ category: null, page: null });
    focusTransactions();
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {params.category && (
        <span className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-input py-1 pr-2 pl-4 lg:min-h-10">
          Category: {params.category}
          <button
            type="button"
            aria-label={`Remove filter ${params.category}`}
            onClick={removeCategory}
            className="grid size-8 place-items-center rounded-pill text-foreground hover:bg-soft"
          >
            {removeIcon}
          </button>
        </span>
      )}
      {range && (
        <span className="inline-flex min-h-11 items-center rounded-pill bg-soft px-4 lg:min-h-10">
          Dates: {formatDay(range.startDate)} – {formatDay(range.endDate)}
        </span>
      )}
      <button
        type="button"
        onClick={clear}
        className="min-h-11 font-semibold text-primary underline underline-offset-2 lg:min-h-10"
      >
        Clear filters
      </button>
    </div>
  );
}

export function RemovedCategoryNote({ infoIcon }: { infoIcon: ReactNode }): ReactNode {
  const [params, setParams] = useDashboardParams();
  const filters = useQuery(dashboardQueries.filters());
  const [removed, setRemoved] = useState<string | null>(null);
  const known = filters.data?.categories.map((category) => category.name);
  const stale = known && params.category && !known.includes(params.category) ? params.category : null;

  if (stale && stale !== removed) setRemoved(stale);
  if (!stale && removed && params.category && params.category !== removed) setRemoved(null);

  useEffect(() => {
    if (stale) void setParams({ category: null, page: null });
  }, [stale, setParams]);
  if (!removed) return null;

  return (
    <p
      role="status"
      className="mt-4 flex items-center gap-3 rounded-panel bg-warning-surface px-4 py-3 font-semibold text-warning-text"
    >
      {infoIcon}
      {`\u201c${removed}\u201d is no longer available, so all categories are shown`}
    </p>
  );
}
