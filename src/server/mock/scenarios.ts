import type { SpendingData } from "./spending-repository";

export const SCENARIOS = ["error", "empty", "slow", "edge"] as const;
export type Scenario = (typeof SCENARIOS)[number];
export type DataVariant = "normal" | "empty" | "edge";

export const SCENARIO_HEADER = "x-mock-scenario";
export const SLOW_RESPONSE_MS = 12_000;

const LONG_CATEGORY = "Shopping, home improvement and general household retail purchases";
const LONG_MERCHANT = "The Extraordinarily Long-Named Neighbourhood Hardware Emporium (Pty) Ltd";
const LARGE_AMOUNT_CENTS = 125_000_000;
const RENAMED_CATEGORY = "Shopping";

export function readScenario(headers: Headers, enabled: boolean): Scenario | null {
  if (!enabled) return null;
  const value = headers.get(SCENARIO_HEADER);
  return SCENARIOS.find((scenario) => scenario === value) ?? null;
}

export function dataVariantFor(scenario: Scenario | null): DataVariant {
  return scenario === "empty" || scenario === "edge" ? scenario : "normal";
}

export function applyVariant(data: SpendingData, variant: DataVariant): SpendingData {
  if (variant === "empty") return { ...data, ledger: [], budgets: [] };
  if (variant === "edge") return withExtremeValues(data);
  return data;
}

function withExtremeValues(data: SpendingData): SpendingData {
  const rename = (name: string) => (name === RENAMED_CATEGORY ? LONG_CATEGORY : name);
  const lastIndex = data.ledger.length - 1;
  return {
    ...data,
    categories: data.categories.map((category) => ({ ...category, name: rename(category.name) })),
    ledger: data.ledger.map((entry, index) => {
      const renamed = { ...entry, category: rename(entry.category) };
      return index === lastIndex ? { ...renamed, merchant: LONG_MERCHANT, cents: LARGE_AMOUNT_CENTS } : renamed;
    }),
  };
}
