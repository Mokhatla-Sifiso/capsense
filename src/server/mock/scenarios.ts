import type { SpendingData } from "./spending-repository";

export const SCENARIOS = ["error", "empty", "slow", "edge"] as const;
export type Scenario = (typeof SCENARIOS)[number];

export const SCENARIO_HEADER = "x-mock-scenario";
export const SLOW_RESPONSE_MS = 12_000;

const LONG_CATEGORY = "Shopping, home improvement and general household retail purchases";
const LONG_MERCHANT = "The Extraordinarily Long-Named Neighbourhood Hardware Emporium (Pty) Ltd";
const LARGE_AMOUNT_CENTS = 125_000_000;

export function readScenario(headers: Headers, enabled: boolean): Scenario | null {
  if (!enabled) return null;
  const value = headers.get(SCENARIO_HEADER);
  return SCENARIOS.find((scenario) => scenario === value) ?? null;
}

export function emptyData(data: SpendingData): SpendingData {
  return { ...data, ledger: [], budgets: [] };
}

export function extremeData(data: SpendingData): SpendingData {
  const lengthen = (name: string) => (name === "Shopping" ? LONG_CATEGORY : name);
  const categories = data.categories.map((category) => ({ ...category, name: lengthen(category.name) }));
  const ledger = data.ledger.map((entry) => ({ ...entry, category: lengthen(entry.category) }));

  const newest = ledger.at(-1);
  if (newest) {
    newest.merchant = LONG_MERCHANT;
    newest.cents = LARGE_AMOUNT_CENTS;
  }

  return { ...data, categories, ledger };
}
