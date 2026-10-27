import { HttpResponse, http } from "msw";
import { server } from "@/test/msw";
import { specFilters, specGoals, specProfile, specTransactions } from "@/test/spec-samples";
import {
  getCategories,
  getFilters,
  getGoals,
  getProfile,
  getSummary,
  getTransactions,
  getTrends,
} from "./spending-api";

function recordRequests(): URL[] {
  const seen: URL[] = [];
  server.events.on("request:start", ({ request }) => {
    seen.push(new URL(request.url));
  });
  return seen;
}

afterEach(() => {
  server.events.removeAllListeners();
});

describe("spending API", () => {
  it("asks for the fixed customer's endpoints", async () => {
    const seen = recordRequests();
    await getProfile();
    await getGoals();
    await getFilters();
    expect(seen.map((url) => url.pathname)).toEqual([
      "/api/customers/12345/profile",
      "/api/customers/12345/goals",
      "/api/customers/12345/filters",
    ]);
  });

  it("returns the checked data", async () => {
    await expect(getProfile()).resolves.toEqual(specProfile);
    await expect(getGoals()).resolves.toEqual(specGoals);
    await expect(getFilters()).resolves.toEqual(specFilters);
  });

  it("sends the period and the number of months", async () => {
    const seen = recordRequests();
    await getSummary("90d");
    await getTrends(24);
    expect(seen.map((url) => url.search)).toEqual(["?period=90d", "?months=24"]);
  });

  it("sends either a period or a custom range for categories, never both", async () => {
    const seen = recordRequests();
    await getCategories({ period: "7d" });
    await getCategories({ startDate: "2024-09-01", endDate: "2024-09-16" });
    expect(seen.map((url) => url.search)).toEqual(["?period=7d", "?startDate=2024-09-01&endDate=2024-09-16"]);
  });

  it("leaves out transaction filters that aren't set", async () => {
    const seen = recordRequests();
    await getTransactions({ limit: 20, offset: 40, sortBy: "amount_desc" });
    await getTransactions({ limit: 20, offset: 0, sortBy: "date_desc", category: "Dining", startDate: undefined });
    expect(seen.map((url) => url.search)).toEqual([
      "?limit=20&offset=40&sortBy=amount_desc",
      "?limit=20&offset=0&sortBy=date_desc&category=Dining",
    ]);
  });

  it("returns transactions with their pagination", async () => {
    server.use(http.get("*/api/customers/:customerId/transactions", () => HttpResponse.json(specTransactions)));
    await expect(getTransactions({ limit: 20, offset: 0, sortBy: "date_desc" })).resolves.toEqual(specTransactions);
  });
});
