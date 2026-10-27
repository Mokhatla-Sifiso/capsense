import { createLoader, createParser, parseAsNumberLiteral, parseAsString, parseAsStringLiteral } from "nuqs/server";
import { z } from "zod";
import type { CategoryRange, TransactionParams } from "@/lib/api/spending-api";
import { PERIODS, SORT_ORDERS } from "@/schemas/api";

export const PAGE_SIZE = 20;
export const MONTH_OPTIONS = [3, 6, 12, 24] as const;

const isoDay = z.iso.date();

const parseAsDay = createParser({
  parse: (value: string) => (isoDay.safeParse(value).success ? value : null),
  serialize: (value: string) => value,
});

const parseAsPage = createParser({
  parse: (value: string) => (/^\d+$/.test(value) && Number(value) >= 1 ? Number(value) : null),
  serialize: (value: number) => String(value),
});

export const dashboardParams = {
  period: parseAsStringLiteral(PERIODS).withDefault("30d"),
  startDate: parseAsDay,
  endDate: parseAsDay,
  months: parseAsNumberLiteral(MONTH_OPTIONS).withDefault(12),
  category: parseAsString,
  sort: parseAsStringLiteral(SORT_ORDERS).withDefault("date_desc"),
  page: parseAsPage.withDefault(1),
};

export const loadDashboardParams = createLoader(dashboardParams);

export type DashboardParams = Awaited<ReturnType<typeof loadDashboardParams>>;

export interface DayRange {
  startDate: string;
  endDate: string;
}

export function customRange(params: DashboardParams): DayRange | null {
  const { startDate, endDate } = params;
  if (startDate === null || endDate === null || startDate > endDate) return null;
  return { startDate, endDate };
}

export function categoryRange(params: DashboardParams): CategoryRange {
  return customRange(params) ?? { period: params.period };
}

export function transactionParams(params: DashboardParams, periodRange: DayRange | undefined): TransactionParams {
  const range = customRange(params) ?? periodRange;
  return {
    limit: PAGE_SIZE,
    offset: (params.page - 1) * PAGE_SIZE,
    sortBy: params.sort,
    category: params.category ?? undefined,
    startDate: range?.startDate,
    endDate: range?.endDate,
  };
}
