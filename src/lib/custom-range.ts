import { formatDay } from "@/lib/format";

export const MAX_RANGE_DAYS = 366;

const DAY_MS = 24 * 60 * 60 * 1000;

function daysCounted(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / DAY_MS + 1;
}

export function rangeProblem(from: string, to: string, today: string): string | null {
  if (!from || !to) return "Enter both a start and an end date";
  if (from > today || to > today) return `Dates can't be after ${formatDay(today)}`;
  if (from > to) return "Start date must be on or before end date";
  if (daysCounted(from, to) > MAX_RANGE_DAYS) return `Choose a range of ${MAX_RANGE_DAYS} days or fewer`;
  return null;
}
