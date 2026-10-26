import {
  PERIODS,
  categoriesSchema,
  filtersSchema,
  goalsSchema,
  profileSchema,
  summarySchema,
  trendsSchema,
} from "@/schemas/api";
import { BUDGETS, CATEGORIES, CUSTOMER, PERIOD_PRESETS } from "./catalogue";
import { SpendingRepository, createMockRepository } from "./spending-repository";

const TODAY = "2024-09-16";
const repository = createMockRepository(TODAY);
const toCents = (rands: number) => Math.round(rands * 100);

describe("every response matches the API contract", () => {
  it.each([
    ["profile", () => profileSchema.parse(repository.profile())],
    ["summary", () => summarySchema.parse(repository.summary("30d"))],
    ["categories", () => categoriesSchema.parse(repository.categories(repository.windowFor("30d")))],
    ["trends", () => trendsSchema.parse(repository.trends(12))],
    ["goals", () => goalsSchema.parse(repository.goals())],
    ["filters", () => filtersSchema.parse(repository.filters())],
  ])("%s", (_name, parse) => {
    expect(parse).not.toThrow();
  });
});

describe("periods end on today and include it", () => {
  it.each([
    ["7d", "2024-09-10"],
    ["30d", "2024-08-18"],
    ["90d", "2024-06-19"],
    ["1y", "2023-09-18"],
  ] as const)("%s starts on %s", (period, start) => {
    expect(repository.windowFor(period)).toEqual({ start, end: TODAY });
  });
});

describe.each(PERIODS)("numbers agree for %s", (period) => {
  const summary = repository.summary(period);
  const breakdown = repository.categories(repository.windowFor(period));
  const amounts = breakdown.categories.map((category) => category.amount);

  it("summary total = category total = sum of category amounts", () => {
    expect(toCents(summary.totalSpent)).toBe(toCents(breakdown.totalAmount));
    expect(amounts.reduce((sum, amount) => sum + toCents(amount), 0)).toBe(toCents(breakdown.totalAmount));
  });

  it("summary count = sum of category counts", () => {
    const counted = breakdown.categories.reduce((sum, category) => sum + category.transactionCount, 0);
    expect(summary.transactionCount).toBe(counted);
  });

  it("shares add up to 100", () => {
    const total = breakdown.categories.reduce((sum, category) => sum + category.percentage, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it("top category is the one with the most spend", () => {
    expect(summary.topCategory).toBe(breakdown.categories.toSorted((a, b) => b.amount - a.amount)[0]?.name);
  });

  it("average is total divided by count", () => {
    expect(summary.averageTransaction).toBe(Math.round(toCents(summary.totalSpent) / summary.transactionCount) / 100);
  });
});

describe("trends", () => {
  it("runs from the join month to today's month", () => {
    const { trends } = repository.trends(24);
    expect(trends[0]?.month).toBe("2023-01");
    expect(trends.at(-1)?.month).toBe("2024-09");
    expect(trends).toHaveLength(21);
  });

  it("returns only the most recent months asked for", () => {
    expect(repository.trends(3).trends.map((trend) => trend.month)).toEqual(["2024-07", "2024-08", "2024-09"]);
  });
});

describe("goals", () => {
  const { goals } = repository.goals();
  const monthToDate = repository.categories({ start: "2024-09-01", end: TODAY });

  it("count the days left in today's month", () => {
    expect(goals.every((goal) => goal.daysRemaining === 14)).toBe(true);
  });

  it("use month-to-date spend for their category", () => {
    for (const goal of goals) {
      const spent = monthToDate.categories.find((category) => category.name === goal.category)?.amount ?? 0;
      expect(goal.currentSpent).toBe(spent);
    }
  });

  it("warn from 80% of the budget", () => {
    for (const goal of goals) {
      expect(goal.status).toBe(goal.percentageUsed >= 80 ? "warning" : "on_track");
    }
  });
});

describe("profile", () => {
  it("keeps the spec's customer and totals every transaction", () => {
    const profile = repository.profile();
    const yearly = repository.trends(24).trends.reduce((sum, month) => sum + toCents(month.totalSpent), 0);
    expect(profile).toMatchObject({ customerId: "12345", name: "John Doe", joinDate: "2023-01-15", currency: "ZAR" });
    expect(toCents(profile.totalSpent)).toBe(yearly);
  });
});

describe("a ledger with no spending", () => {
  const empty = new SpendingRepository({
    today: TODAY,
    customer: CUSTOMER,
    categories: CATEGORIES,
    budgets: BUDGETS,
    presets: PERIOD_PRESETS,
    ledger: [],
  });

  it("returns zeros instead of dividing by zero", () => {
    expect(empty.summary("30d")).toEqual({
      period: "30d",
      totalSpent: 0,
      transactionCount: 0,
      averageTransaction: 0,
      topCategory: "",
      comparedToPrevious: { spentChange: 0, transactionChange: 0 },
    });
  });

  it("lists no categories and keeps goals at zero", () => {
    expect(empty.categories(empty.windowFor("7d")).categories).toEqual([]);
    expect(empty.goals().goals.every((goal) => goal.currentSpent === 0 && goal.status === "on_track")).toBe(true);
  });
});

describe("transactions", () => {
  const query = { limit: 20, offset: 0, sortBy: "date_desc", category: null, startDate: null, endDate: null } as const;

  it("returns the newest 20 first by default", () => {
    const { transactions, pagination } = repository.transactions(query);
    const dates = transactions.map((transaction) => transaction.date);
    expect(transactions).toHaveLength(20);
    expect(dates).toEqual(dates.toSorted().reverse());
    expect(pagination).toMatchObject({ limit: 20, offset: 0, hasMore: true });
  });

  it.each([
    ["date_asc", (a: number, b: number) => a <= b],
    ["amount_desc", (a: number, b: number) => a >= b],
    ["amount_asc", (a: number, b: number) => a <= b],
  ] as const)("sorts by %s", (sortBy, inOrder) => {
    const { transactions } = repository.transactions({ ...query, sortBy, limit: 100 });
    const values = transactions.map((t) => (sortBy === "date_asc" ? Date.parse(t.date) : t.amount));
    expect(values.every((value, index) => index === 0 || inOrder(values[index - 1] ?? value, value))).toBe(true);
  });

  it("pages with offset and says when there is more", () => {
    const first = repository.transactions({ ...query, limit: 10 });
    const second = repository.transactions({ ...query, limit: 10, offset: 10 });
    expect(second.transactions[0]?.id).not.toBe(first.transactions[0]?.id);
    const last = repository.transactions({ ...query, limit: 10, offset: first.pagination.total - 5 });
    expect(last.transactions).toHaveLength(5);
    expect(last.pagination.hasMore).toBe(false);
  });

  it("returns an empty page past the end", () => {
    const { transactions, pagination } = repository.transactions({ ...query, offset: 100_000 });
    expect(transactions).toEqual([]);
    expect(pagination.hasMore).toBe(false);
  });

  it("filters by category, and an unknown category matches nothing", () => {
    const dining = repository.transactions({ ...query, category: "Dining", limit: 100 });
    expect(dining.transactions.every((t) => t.category === "Dining")).toBe(true);
    expect(repository.transactions({ ...query, category: "Pets" }).pagination.total).toBe(0);
  });

  it("filters by date, both ends included", () => {
    const { transactions } = repository.transactions({
      ...query,
      startDate: "2024-09-10",
      endDate: "2024-09-16",
      limit: 100,
    });
    expect(transactions.every((t) => t.date.slice(0, 10) >= "2024-09-10" && t.date.slice(0, 10) <= "2024-09-16")).toBe(
      true,
    );
  });

  it("counts the same transactions as the category breakdown for the same days", () => {
    const window = repository.windowFor("30d");
    const groceries = repository.categories(window).categories.find((c) => c.name === "Groceries");
    const listed = repository.transactions({
      ...query,
      category: "Groceries",
      startDate: window.start,
      endDate: window.end,
    });
    expect(listed.pagination.total).toBe(groceries?.transactionCount);
  });

  it("carries each category's icon and colour", () => {
    const [first] = repository.transactions({ ...query, category: "Groceries" }).transactions;
    expect(first).toMatchObject({ icon: "shopping-cart", categoryColor: "#FF6B6B" });
  });
});

describe("field order", () => {
  it("lists profile fields in the same order as the spec", () => {
    expect(Object.keys(repository.profile())).toEqual([
      "customerId",
      "name",
      "email",
      "joinDate",
      "accountType",
      "totalSpent",
      "currency",
    ]);
  });
});
