import { categoryRange, loadDashboardParams, transactionRequest } from "./dashboard-params";

const load = (query: string) => loadDashboardParams(new URLSearchParams(query));

describe("reading the dashboard from the address bar", () => {
  it("uses the defaults when nothing is set", () => {
    expect(load("")).toEqual({
      period: "30d",
      startDate: null,
      endDate: null,
      months: 12,
      category: null,
      sort: "date_desc",
      page: 1,
    });
  });

  it("reads everything a customer can choose", () => {
    expect(load("period=90d&months=24&category=Dining&sort=amount_desc&page=2")).toMatchObject({
      period: "90d",
      months: 24,
      category: "Dining",
      sort: "amount_desc",
      page: 2,
    });
  });

  it.each([
    ["period=2w", { period: "30d" }],
    ["sort=price", { sort: "date_desc" }],
    ["months=7", { months: 12 }],
    ["page=0", { page: 1 }],
    ["page=-3", { page: 1 }],
    ["page=abc", { page: 1 }],
    ["startDate=2024-02-30", { startDate: null }],
  ])("resets an invalid %s to its default and keeps the rest", (query, expected) => {
    expect(load(`${query}&category=Dining`)).toMatchObject({ ...expected, category: "Dining" });
  });
});

describe("turning the address bar into API requests", () => {
  it("asks categories for the period, or for the custom range when both dates are set", () => {
    expect(categoryRange(load("period=7d"))).toEqual({ period: "7d" });
    expect(categoryRange(load("period=7d&startDate=2024-09-01&endDate=2024-09-16"))).toEqual({
      startDate: "2024-09-01",
      endDate: "2024-09-16",
    });
  });

  it("ignores a half-set or back-to-front custom range", () => {
    expect(categoryRange(load("startDate=2024-09-01"))).toEqual({ period: "30d" });
    expect(categoryRange(load("startDate=2024-09-16&endDate=2024-09-01"))).toEqual({ period: "30d" });
  });

  it("asks for 90 days everywhere, from the first page, after Last 90 days is chosen", () => {
    const params = load("sort=amount_desc&period=90d");
    expect(params.period).toBe("90d");
    expect(categoryRange(params)).toEqual({ period: "90d" });
    expect(transactionRequest(params)).toMatchObject({ offset: 0, range: { period: "90d" } });
  });

  it("pages transactions 20 at a time", () => {
    expect(transactionRequest(load("page=3&sort=amount_asc"))).toEqual({
      range: { period: "30d" },
      limit: 20,
      offset: 40,
      sortBy: "amount_asc",
      category: undefined,
    });
  });

  it("keeps the chosen category", () => {
    expect(transactionRequest(load("category=Dining"))).toMatchObject({ category: "Dining" });
  });

  it("asks for the custom dates instead of the period when they are on", () => {
    const params = load("period=90d&startDate=2024-09-01&endDate=2024-09-05");
    expect(transactionRequest(params).range).toEqual({ startDate: "2024-09-01", endDate: "2024-09-05" });
  });
});
