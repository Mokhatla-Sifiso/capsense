import { emptyData, extremeData, readScenario } from "./scenarios";
import { SpendingRepository, mockData } from "./spending-repository";

const TODAY = "2024-09-16";
const headers = (value: string) => new Headers({ "x-mock-scenario": value });

describe("readScenario", () => {
  it("ignores the header completely when scenarios are switched off", () => {
    expect(readScenario(headers("error"), false)).toBeNull();
  });

  it("reads a known scenario when switched on, and ignores anything else", () => {
    expect(readScenario(headers("slow"), true)).toBe("slow");
    expect(readScenario(headers("explode"), true)).toBeNull();
    expect(readScenario(new Headers(), true)).toBeNull();
  });
});

describe("empty data", () => {
  const empty = new SpendingRepository(emptyData(mockData(TODAY)));

  it("keeps the spec's shape with empty lists and zero totals", () => {
    expect(empty.summary("30d").totalSpent).toBe(0);
    expect(empty.categories(empty.windowFor("30d")).categories).toEqual([]);
    expect(empty.goals().goals).toEqual([]);
    expect(
      empty.transactions({ limit: 20, offset: 0, sortBy: "date_desc", category: null, startDate: null, endDate: null }),
    ).toEqual({ transactions: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } });
  });
});

describe("edge data", () => {
  const edge = new SpendingRepository(extremeData(mockData(TODAY)));
  const window = edge.windowFor("30d");
  const breakdown = edge.categories(window);
  const newest = edge.transactions({
    limit: 1,
    offset: 0,
    sortBy: "date_desc",
    category: null,
    startDate: null,
    endDate: null,
  }).transactions[0];

  it("has a merchant and a category name of at least 60 characters", () => {
    expect(newest?.merchant.length).toBeGreaterThanOrEqual(60);
    expect(edge.filters().categories.some((category) => category.name.length >= 60)).toBe(true);
  });

  it("has an amount of at least R1 000 000", () => {
    expect(newest?.amount).toBeGreaterThanOrEqual(1_000_000);
  });

  it("still adds up across endpoints", () => {
    const sum = breakdown.categories.reduce((total, category) => total + Math.round(category.amount * 100), 0);
    expect(Math.round(edge.summary("30d").totalSpent * 100)).toBe(Math.round(breakdown.totalAmount * 100));
    expect(sum).toBe(Math.round(breakdown.totalAmount * 100));
  });
});
