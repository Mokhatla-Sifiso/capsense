import { ENDPOINTS, getCategories, getSummary, getTransactions, getTrends } from "@/test/endpoints";
import { type CustomerRoute, callRoute } from "@/test/routes";

async function body(route: CustomerRoute, path: string, query: string) {
  return (await callRoute(route, path, { query })).json();
}

describe.each(ENDPOINTS)("GET /api/customers/{customerId}/$path", ({ path, route, schema }) => {
  it("answers 200 with exactly the fields in the spec", async () => {
    const response = await callRoute(route, path);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(schema.parse(json)).toEqual(json);
  });

  it("answers 404 for a customer that doesn't exist", async () => {
    const response = await callRoute(route, path, { customerId: "99999" });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found", message: "Customer not found" });
  });
});

describe("query parameters reach the repository", () => {
  it("summary uses the period asked for and 30d for anything unknown", async () => {
    expect((await body(getSummary, "spending/summary", "?period=7d")).period).toBe("7d");
    expect((await body(getSummary, "spending/summary", "?period=2w")).period).toBe("30d");
  });

  it("trends returns 12 months by default and at most 24", async () => {
    expect((await body(getTrends, "spending/trends", "")).trends).toHaveLength(12);
    expect((await body(getTrends, "spending/trends", "?months=3")).trends).toHaveLength(3);
    expect((await body(getTrends, "spending/trends", "?months=30")).trends).toHaveLength(21);
  });

  it("categories covers the period by default and a custom range when both dates are given", async () => {
    expect((await body(getCategories, "spending/categories", "?period=7d")).dateRange).toEqual({
      startDate: "2024-09-10",
      endDate: "2024-09-16",
    });
    const custom = await body(getCategories, "spending/categories", "?startDate=2024-09-01&endDate=2024-09-05");
    expect(custom.dateRange).toEqual({ startDate: "2024-09-01", endDate: "2024-09-05" });
  });

  it("categories answers 400 for a date that isn't real", async () => {
    const response = await callRoute(getCategories, "spending/categories", { query: "?startDate=2024-02-30" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "bad_request",
      message: "startDate must be a real date in YYYY-MM-DD format",
    });
  });

  it("an unknown customer is a 404 even when the dates are also wrong", async () => {
    const response = await callRoute(getCategories, "spending/categories", {
      customerId: "99999",
      query: "?startDate=nope",
    });
    expect(response.status).toBe(404);
  });

  it("transactions uses the spec defaults", async () => {
    const { transactions, pagination } = await body(getTransactions, "transactions", "");
    expect(transactions).toHaveLength(20);
    expect(pagination).toMatchObject({ limit: 20, offset: 0, hasMore: true });
  });

  it("transactions caps the page at 100 and ignores an unknown sort order", async () => {
    const { transactions, pagination } = await body(getTransactions, "transactions", "?limit=150&sortBy=price");
    expect(transactions).toHaveLength(100);
    expect(pagination.limit).toBe(100);
  });

  it("transactions filters by category and answers 400 for a malformed date", async () => {
    const dining = await body(getTransactions, "transactions", "?category=Dining&limit=100");
    expect(dining.transactions.every((t: { category: string }) => t.category === "Dining")).toBe(true);
    expect((await callRoute(getTransactions, "transactions", { query: "?startDate=2024/09/01" })).status).toBe(400);
  });
});
