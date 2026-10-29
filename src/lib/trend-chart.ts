import type { MonthlyTrend } from "@/schemas/api";

export interface MonthSlot {
  month: string;
  trend: MonthlyTrend | null;
}

const NICE_STEPS = [1, 2.5, 5] as const;
const LARGEST_STEP = 5;

function monthAfter(isoMonth: string): string {
  const year = Number(isoMonth.slice(0, 4));
  const month = Number(isoMonth.slice(5, 7));
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function monthSlots(trends: readonly MonthlyTrend[]): MonthSlot[] {
  const byMonth = new Map(trends.map((trend) => [trend.month, trend]));
  const months = [...byMonth.keys()].toSorted();
  const first = months[0];
  const last = months.at(-1);
  if (!first || !last) return [];
  const slots: MonthSlot[] = [];
  for (let month = first; month <= last; month = monthAfter(month)) {
    slots.push({ month, trend: byMonth.get(month) ?? null });
  }
  return slots;
}

export function niceMax(highest: number): number {
  let power = 1;
  while (power * LARGEST_STEP < highest) power *= 10;
  while (power > 1 && power / 10 >= highest) power /= 10;
  for (const step of NICE_STEPS) {
    if (step * power >= highest) return step * power;
  }
  return 10 * power;
}

export function showsYear(slots: readonly MonthSlot[], index: number): boolean {
  return index === 0 || slots[index]?.month.endsWith("-01") === true;
}

export function labelEvery(count: number, width: number, labelWidth = 44): number {
  if (width <= 0) return 1;
  return Math.max(1, Math.ceil((count * labelWidth) / width));
}
