import type { CategorySpend, Categories, Filters, Goals, Period, Profile, Summary, Trends } from "@/schemas/api";
import {
  addDays,
  type DateWindow,
  dayOfMonth,
  daysBetween,
  daysInMonth,
  isWithin,
  monthsBetween,
  startOfMonth,
} from "./calendar";
import { BUDGETS, CATEGORIES, CUSTOMER, PERIOD_PRESETS } from "./catalogue";
import type { Budget, CategoryProfile, Customer, PeriodPreset } from "./catalogue";
import { generateLedger, type LedgerEntry } from "./ledger";
import { averageRands, percentChange, percentOf, sharesOfTotal, toRands } from "./money";

export interface SpendingData {
  today: string;
  customer: Customer;
  categories: readonly CategoryProfile[];
  budgets: readonly Budget[];
  presets: readonly PeriodPreset[];
  ledger: readonly LedgerEntry[];
}

interface Totals {
  cents: number;
  count: number;
}

const LEDGER_SEED = 12345;
const WARNING_AT_PERCENT = 80;

export class SpendingRepository {
  constructor(private readonly data: SpendingData) {}

  windowFor(period: Period): DateWindow {
    const days = this.data.presets.find((preset) => preset.value === period)?.days ?? 30;
    return { start: addDays(this.data.today, 1 - days), end: this.data.today };
  }

  profile(): Profile {
    return { ...this.data.customer, totalSpent: toRands(this.totals(this.data.ledger).cents) };
  }

  summary(period: Period): Summary {
    const current = this.windowFor(period);
    const length = daysBetween(current.start, current.end) + 1;
    const previous = { start: addDays(current.start, -length), end: addDays(current.start, -1) };
    const now = this.totals(this.entriesIn(current));
    const before = this.totals(this.entriesIn(previous));
    return {
      period,
      totalSpent: toRands(now.cents),
      transactionCount: now.count,
      averageTransaction: averageRands(now.cents, now.count),
      topCategory: this.topCategory(this.categories(current).categories),
      comparedToPrevious: {
        spentChange: percentChange(now.cents, before.cents),
        transactionChange: percentChange(now.count, before.count),
      },
    };
  }

  categories(window: DateWindow): Categories {
    const entries = this.entriesIn(window);
    const spent = this.data.categories
      .map((category) => ({ category, ...this.totals(entries.filter((entry) => entry.category === category.name)) }))
      .filter((row) => row.count > 0);
    const shares = sharesOfTotal(spent.map((row) => row.cents));
    return {
      dateRange: { startDate: window.start, endDate: window.end },
      totalAmount: toRands(this.totals(entries).cents),
      categories: spent.map((row, index) => ({
        name: row.category.name,
        amount: toRands(row.cents),
        percentage: shares[index] ?? 0,
        transactionCount: row.count,
        color: row.category.color,
        icon: row.category.icon,
      })),
    };
  }

  trends(months: number): Trends {
    const all = monthsBetween(this.data.customer.joinDate, this.data.today).map((month) => {
      const { cents, count } = this.totals(this.data.ledger.filter((entry) => entry.day.startsWith(month)));
      return {
        month,
        totalSpent: toRands(cents),
        transactionCount: count,
        averageTransaction: averageRands(cents, count),
      };
    });
    return { trends: all.slice(Math.max(all.length - months, 0)) };
  }

  goals(): Goals {
    const today = this.data.today;
    const monthToDate = this.entriesIn({ start: startOfMonth(today), end: today });
    return {
      goals: this.data.budgets.map((budget) => {
        const spentCents = this.totals(monthToDate.filter((entry) => entry.category === budget.category)).cents;
        const percentageUsed = percentOf(spentCents, budget.monthlyBudgetCents);
        return {
          id: budget.id,
          category: budget.category,
          monthlyBudget: toRands(budget.monthlyBudgetCents),
          currentSpent: toRands(spentCents),
          percentageUsed,
          daysRemaining: daysInMonth(today) - dayOfMonth(today),
          status: percentageUsed >= WARNING_AT_PERCENT ? "warning" : "on_track",
        };
      }),
    };
  }

  filters(): Filters {
    return {
      categories: this.data.categories.map(({ name, color, icon }) => ({ name, color, icon })),
      dateRangePresets: this.data.presets.map(({ label, value }) => ({ label, value })),
    };
  }

  private entriesIn(window: DateWindow): LedgerEntry[] {
    return this.data.ledger.filter((entry) => isWithin(entry.day, window));
  }

  private totals(entries: readonly LedgerEntry[]): Totals {
    return { cents: entries.reduce((sum, entry) => sum + entry.cents, 0), count: entries.length };
  }

  private topCategory(rows: readonly CategorySpend[]): string {
    const [top] = [...rows].sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
    return top?.name ?? "";
  }
}

export function createMockRepository(today: string): SpendingRepository {
  return new SpendingRepository({
    today,
    customer: CUSTOMER,
    categories: CATEGORIES,
    budgets: BUDGETS,
    presets: PERIOD_PRESETS,
    ledger: generateLedger({ categories: CATEGORIES, from: CUSTOMER.joinDate, to: today, seed: LEDGER_SEED }),
  });
}
