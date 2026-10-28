import { formatCount, formatDay } from "@/lib/format";
import type { CategorySpend } from "@/schemas/api";

interface DayRange {
  startDate: string;
  endDate: string;
}

export function byAmount(categories: readonly CategorySpend[]): CategorySpend[] {
  return categories.toSorted((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
}

export function wholeShare(percentage: number): string {
  if (percentage > 0 && Math.round(percentage) === 0) return "<1%";
  return `${Math.round(percentage)}%`;
}

export function transactionsLabel(count: number): string {
  return `${formatCount(count)} ${count === 1 ? "transaction" : "transactions"}`;
}

export function rangeCaption(range: DayRange | undefined): string | null {
  if (!range) return null;
  if (range.startDate === range.endDate) return formatDay(range.startDate);
  return `${formatDay(range.startDate)} – ${formatDay(range.endDate)}`;
}
