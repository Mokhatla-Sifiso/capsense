"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SectionError } from "@/components/states/section-error";
import { categoryAppearance } from "@/lib/category-appearance";
import { type ChangeStatement, type Direction, changeStatement } from "@/lib/change-statement";
import { formatCount, formatCurrency } from "@/lib/format";
import { periodLabel } from "@/lib/period-options";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { customRange } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";
import type { Filters, Summary } from "@/schemas/api";
import { SUMMARY_HEIGHT, SummarySkeleton } from "./summary-skeleton";

export interface SummaryIcons {
  wallet: ReactNode;
  arrows: Record<Direction, ReactNode>;
  problem: ReactNode;
  note: ReactNode;
}

interface SummaryCardProps {
  icons: SummaryIcons;
  illustration?: ReactNode;
}

interface FiguresProps {
  summary: Summary;
  currency: string;
  filters: Filters | undefined;
  icons: SummaryIcons;
  illustration: ReactNode;
}

const NOTHING = "—";
const STAT =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-spend-line py-3.5 last:border-b-0 md:block md:border-b-0 md:border-l md:py-0 md:pl-5 md:first:border-l-0 md:first:pl-0";
const STAT_LABEL = "text-control font-semibold text-spend-muted md:text-sm";
const STAT_VALUE = "text-right text-kpi font-bold md:mt-2 md:text-left";
const AMOUNT_FIT: readonly [longest: number, size: string][] = [
  [10, ""],
  [12, "text-[length:min(var(--text-kpi-spent),16cqi)]"],
  [14, "text-[length:min(var(--text-kpi-spent),14cqi)]"],
  [16, "text-[length:min(var(--text-kpi-spent),12cqi)]"],
];
const LONGEST_FIT = "text-[length:min(var(--text-kpi-spent),10cqi)]";

function amountFit(amount: string): string {
  return AMOUNT_FIT.find(([longest]) => amount.length <= longest)?.[1] ?? LONGEST_FIT;
}

function TopCategory({ name, filters }: { name: string; filters: Filters | undefined }): ReactNode {
  const known = filters?.categories.find((category) => category.name === name);
  const { background, glyph: Glyph } = categoryAppearance({ name: known?.name ?? "", icon: known?.icon ?? "" });
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={`grid size-6 place-items-center rounded-circle text-chip-glyph ring-2 ring-chip-glyph md:size-7 ${background}`}
      >
        <Glyph weight="fill" size={14} focusable={false} />
      </span>
      {name}
    </span>
  );
}

function SpentChange({ change, icons }: { change: ChangeStatement; icons: SummaryIcons }): ReactNode {
  return (
    <dd className="mt-3 flex items-center gap-2 text-change font-semibold md:mt-2">
      <span aria-hidden className="grid size-5.5 shrink-0 place-items-center rounded-circle bg-spend-fg text-spend">
        {icons.arrows[change.direction]}
      </span>
      {change.text}
    </dd>
  );
}

function Figures({ summary, currency, filters, icons, illustration }: FiguresProps): ReactNode {
  const empty = summary.transactionCount === 0;
  const spentChange = empty ? null : changeStatement(summary.comparedToPrevious?.spentChange);
  const countChange = empty ? null : changeStatement(summary.comparedToPrevious?.transactionChange);
  const spent = formatCurrency(summary.totalSpent, currency);

  return (
    <section
      aria-label="Spending summary"
      className={`relative overflow-hidden rounded-hero bg-spend px-5 pt-5.5 pb-5 text-spend-fg shadow-card md:px-7 md:pt-7 md:pb-6 ${SUMMARY_HEIGHT}`}
    >
      {illustration}
      <span
        aria-hidden
        className="absolute top-5.5 right-5 grid size-12 place-items-center rounded-hero-glyph bg-spend-fg text-spend md:top-7 md:right-7"
      >
        {icons.wallet}
      </span>

      <dl className="@container relative pr-16">
        <dt className="text-hero-label font-semibold text-spend-muted">
          Spent · {periodLabel(filters?.dateRangePresets, summary.period)}
        </dt>
        <dd className={`mt-1 text-kpi-spent font-bold ${amountFit(spent)}`}>{spent}</dd>
        {empty && <dd className="mt-3 text-change font-semibold md:mt-2">No spending in this period</dd>}
        {spentChange && <SpentChange change={spentChange} icons={icons} />}
      </dl>

      <dl className="relative mt-4.5 border-t border-spend-line md:-mx-5 md:mt-6.5 md:grid md:grid-cols-3 md:px-5 md:pt-5">
        <div className={STAT}>
          <dt className={STAT_LABEL}>Transactions</dt>
          <dd className={STAT_VALUE}>{formatCount(summary.transactionCount)}</dd>
          {countChange && (
            <dd className="col-span-2 flex items-center gap-1.5 text-stat-sub text-spend-muted md:mt-1">
              <span aria-hidden>{icons.arrows[countChange.direction]}</span>
              {countChange.text}
            </dd>
          )}
        </div>
        <div className={STAT}>
          <dt className={STAT_LABEL}>Average transaction</dt>
          <dd className={STAT_VALUE}>{empty ? NOTHING : formatCurrency(summary.averageTransaction, currency)}</dd>
        </div>
        <div className={STAT}>
          <dt className={STAT_LABEL}>Top category</dt>
          <dd className={STAT_VALUE}>
            {empty || !summary.topCategory ? NOTHING : <TopCategory name={summary.topCategory} filters={filters} />}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function SummaryCard({ icons, illustration }: SummaryCardProps): ReactNode {
  const [params] = useDashboardParams();
  const custom = customRange(params) !== null;
  const summary = useQuery({ ...dashboardQueries.summary(params.period), enabled: !custom });
  const profile = useQuery(dashboardQueries.profile());
  const filters = useQuery(dashboardQueries.filters());

  if (custom) {
    return (
      <section
        aria-label="Spending summary"
        className="flex items-center gap-4 rounded-card bg-card p-card shadow-card"
      >
        {icons.note}
        <p className="font-semibold">Summary is available for preset periods only</p>
      </section>
    );
  }

  if (summary.isPending || profile.isPending) return <SummarySkeleton />;

  if (!summary.data || !profile.data) {
    const retry = (): void => {
      void summary.refetch();
      if (profile.isError) void profile.refetch();
    };
    return (
      <section aria-label="Spending summary">
        <SectionError block="summary" icon={icons.problem} onRetry={retry} className="bg-card" />
      </section>
    );
  }

  return (
    <Figures
      summary={summary.data}
      currency={profile.data.currency}
      filters={filters.data}
      icons={icons}
      illustration={illustration}
    />
  );
}
