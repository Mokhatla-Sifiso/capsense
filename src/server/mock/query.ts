import { PERIODS, SORT_ORDERS, type Period, type SortOrder } from "@/schemas/api";
import type { DateWindow } from "./calendar";

export interface NumberRule {
  min: number;
  max: number;
  fallback: number;
}

export interface DateFilter {
  startDate: string | null;
  endDate: string | null;
}

export type DateFilterResult = { ok: true; filter: DateFilter } | { ok: false; message: string };

export const MONTHS: NumberRule = { min: 1, max: 24, fallback: 12 };
export const LIMIT: NumberRule = { min: 1, max: 100, fallback: 20 };
export const OFFSET: NumberRule = { min: 0, max: Number.MAX_SAFE_INTEGER, fallback: 0 };

const WHOLE_NUMBER = /^-?\d+$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function readPeriod(value: string | null): Period {
  return PERIODS.find((period) => period === value) ?? "30d";
}

export function readSortOrder(value: string | null): SortOrder {
  return SORT_ORDERS.find((order) => order === value) ?? "date_desc";
}

export function readWholeNumber(value: string | null, rule: NumberRule): number {
  if (value === null || !WHOLE_NUMBER.test(value)) return rule.fallback;
  return Math.min(rule.max, Math.max(rule.min, Number(value)));
}

export function isRealDay(value: string): boolean {
  const time = Date.parse(`${value}T00:00:00Z`);
  return ISO_DAY.test(value) && !Number.isNaN(time) && new Date(time).toISOString().startsWith(value);
}

export function readDateFilter(params: URLSearchParams): DateFilterResult {
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  if (startDate !== null && !isRealDay(startDate)) {
    return { ok: false, message: "startDate must be a real date in YYYY-MM-DD format" };
  }
  if (endDate !== null && !isRealDay(endDate)) {
    return { ok: false, message: "endDate must be a real date in YYYY-MM-DD format" };
  }
  if (startDate !== null && endDate !== null && startDate > endDate) {
    return { ok: false, message: "startDate must be on or before endDate" };
  }
  return { ok: true, filter: { startDate, endDate } };
}

export function customWindow(filter: DateFilter): DateWindow | null {
  if (filter.startDate === null || filter.endDate === null) return null;
  return { start: filter.startDate, end: filter.endDate };
}
