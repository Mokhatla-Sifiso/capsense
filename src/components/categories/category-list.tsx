"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { categoryAppearance } from "@/lib/category-appearance";
import { byAmount, rangeCaption, transactionsLabel, wholeShare } from "@/lib/category-rows";
import { formatCurrency, formatPercent } from "@/lib/format";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { categoryRange } from "@/lib/url-state/dashboard-params";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";
import type { CategorySpend } from "@/schemas/api";
import {
  CATEGORY_CARD,
  CATEGORY_HEADER,
  CATEGORY_ROW,
  CATEGORY_ROWS,
  CategoriesHeading,
  CategorySkeleton,
} from "./category-skeleton";

interface CategoryListProps {
  problem: ReactNode;
}

interface CategoryRowProps {
  category: CategorySpend;
  currency: string;
}

const RING_RADIUS = 19.5;

function ShareRing({ percentage, stroke }: { percentage: number; stroke: string }): ReactNode {
  const share = Math.min(Math.max(percentage, 0), 100);
  return (
    <span className="relative hidden size-11 shrink-0 place-items-center md:grid">
      <svg viewBox="0 0 44 44" className="absolute inset-0" focusable={false}>
        <circle cx="22" cy="22" r={RING_RADIUS} strokeWidth="5" className="fill-none stroke-track" />
        {share > 0 && (
          <circle
            cx="22"
            cy="22"
            r={RING_RADIUS}
            strokeWidth="5"
            pathLength={100}
            strokeDasharray={`${share} 100`}
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
            className={`fill-none ${stroke}`}
          />
        )}
      </svg>
      <span className="relative text-(length:--text-ring) leading-none font-bold">{wholeShare(percentage)}</span>
    </span>
  );
}

function CategoryRow({ category, currency }: CategoryRowProps): ReactNode {
  const { background, stroke, glyph: Glyph } = categoryAppearance(category);
  const amount = formatCurrency(category.amount, currency);
  const share = formatPercent(category.percentage);
  const transactions = transactionsLabel(category.transactionCount);

  return (
    <li className={`${CATEGORY_ROW} bg-row`}>
      <span className="sr-only">{`${category.name}: ${amount}, ${share} of spending, ${transactions}`}</span>
      <span aria-hidden className={`grid w-11 shrink-0 place-items-center text-chip-glyph md:w-14 ${background}`}>
        <Glyph weight="fill" size={22} focusable={false} />
      </span>
      <span aria-hidden className="flex min-w-0 flex-1 items-center gap-4 py-2.5 pr-4 pl-4 md:py-3 md:pl-5">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="max-w-full font-bold break-words">{category.name}</span>
            <span className="ml-auto font-bold md:hidden">{amount}</span>
          </span>
          <span className="block text-sm text-muted-foreground">
            {transactions}
            <span className="md:hidden"> · {share}</span>
          </span>
        </span>
        <span className="hidden shrink-0 font-bold md:block">{amount}</span>
        <ShareRing percentage={category.percentage} stroke={stroke} />
      </span>
    </li>
  );
}

export function CategoryList({ problem }: CategoryListProps): ReactNode {
  const [params] = useDashboardParams();
  const categories = useQuery(dashboardQueries.categories(categoryRange(params)));
  const profile = useQuery(dashboardQueries.profile());

  if (categories.isPending || profile.isPending) return <CategorySkeleton />;

  if (!categories.data || !profile.data) {
    const retry = (): void => {
      void categories.refetch();
      if (profile.isError) void profile.refetch();
    };
    return (
      <section aria-labelledby="categories-heading" className={CATEGORY_CARD}>
        <CategoriesHeading />
        <div className="mt-card-gap flex items-center gap-3 rounded-panel border border-danger-border p-4 md:p-5">
          <span className="text-danger-text">{problem}</span>
          <p className="flex-1 font-semibold text-danger-text">Couldn&apos;t load categories</p>
          <button
            type="button"
            onClick={retry}
            className="min-h-11 rounded-pill border border-primary px-5 font-semibold text-primary"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const { totalAmount, dateRange } = categories.data;
  const rows = byAmount(categories.data.categories);
  const currency = profile.data.currency;

  if (rows.length === 0 || totalAmount === 0) {
    return (
      <section aria-labelledby="categories-heading" className={CATEGORY_CARD}>
        <CategoriesHeading />
        <p className="mt-3 text-muted-foreground">No category spending in this period</p>
      </section>
    );
  }

  const caption = rangeCaption(dateRange);

  return (
    <section aria-labelledby="categories-heading" className={CATEGORY_CARD}>
      <div className={CATEGORY_HEADER}>
        <div>
          <CategoriesHeading />
          {caption && <p className="mt-1 text-sm text-muted-foreground">{caption}</p>}
        </div>
        <p className="shrink-0 rounded-10 bg-soft px-3 py-1.5 text-control font-bold text-heading">
          {formatCurrency(totalAmount, currency)} total
        </p>
      </div>
      <ul className={CATEGORY_ROWS}>
        {rows.map((category, index) => (
          <CategoryRow key={`${category.name}-${index}`} category={category} currency={currency} />
        ))}
      </ul>
    </section>
  );
}
