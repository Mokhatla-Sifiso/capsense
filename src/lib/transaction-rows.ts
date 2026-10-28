import { formatDay } from "@/lib/format";
import { formatSouthAfricaTime } from "@/lib/south-africa-time";
import type { Transaction } from "@/schemas/api";

interface When {
  day: string;
  time: string;
}

const SOUTH_AFRICA_OFFSET_MS = 2 * 60 * 60 * 1000;

export function transactionWhen(instant: string): When | null {
  const moment = new Date(instant);
  if (!instant || Number.isNaN(moment.getTime())) return null;
  const localDay = new Date(moment.getTime() + SOUTH_AFRICA_OFFSET_MS).toISOString().slice(0, 10);
  return { day: formatDay(localDay), time: formatSouthAfricaTime(moment) };
}

export function transactionMeta({ category, paymentMethod }: Transaction): string {
  return [category, paymentMethod].filter(Boolean).join(" · ");
}

export function uniqueById(transactions: readonly Transaction[]): Transaction[] {
  const seen = new Set<string>();
  return transactions.filter(({ id }) => !seen.has(id) && seen.add(id));
}
