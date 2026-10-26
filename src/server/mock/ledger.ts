import { addDays } from "./calendar";
import type { CategoryProfile } from "./catalogue";
import { between, pick, seededRandom } from "./random";

export interface LedgerEntry {
  id: string;
  date: string;
  day: string;
  category: string;
  merchant: string;
  description: string;
  paymentMethod: string;
  cents: number;
}

export interface LedgerOptions {
  categories: readonly CategoryProfile[];
  from: string;
  to: string;
  seed: number;
}

const FIRST_ID = 100_001;
const EARLIEST_UTC_HOUR = 4;
const LATEST_UTC_HOUR = 18;

export function generateLedger({ categories, from, to, seed }: LedgerOptions): LedgerEntry[] {
  const random = seededRandom(seed);
  const entries: Omit<LedgerEntry, "id">[] = [];

  for (let day = from; day <= to; day = addDays(day, 1)) {
    for (const category of categories) {
      if (random() >= category.dailyChance) continue;
      const merchant = pick(random, category.merchants);
      const hour = String(between(random, EARLIEST_UTC_HOUR, LATEST_UTC_HOUR)).padStart(2, "0");
      const minute = String(between(random, 0, 59)).padStart(2, "0");
      entries.push({
        date: `${day}T${hour}:${minute}:00Z`,
        day,
        category: category.name,
        merchant: merchant.name,
        description: merchant.description,
        paymentMethod: merchant.paymentMethod,
        cents: between(random, category.minCents, category.maxCents),
      });
    }
  }

  return entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry, index) => ({ id: `txn_${FIRST_ID + index}`, ...entry }));
}
