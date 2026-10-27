import { ENDPOINTS, getGoals, getProfile, getTransactions } from "@/test/endpoints";
import { callRoute } from "@/test/routes";

const scenario = (name: string) => ({ headers: { "x-mock-scenario": name } });

describe("with test scenarios switched off", () => {
  it("ignores the header and answers normally", async () => {
    const response = await callRoute(getProfile, "profile", scenario("error"));
    expect(response.status).toBe(200);
  });
});

describe("with test scenarios switched on", () => {
  beforeEach(() => {
    vi.stubEnv("MOCK_SCENARIOS", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it.each(ENDPOINTS)("error makes $path answer 500", async ({ path, route }) => {
    const response = await callRoute(route, path, scenario("error"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "server_error", message: "Something went wrong" });
  });

  it.each(ENDPOINTS)("empty keeps $path in the spec's shape", async ({ path, route, schema }) => {
    const response = await callRoute(route, path, scenario("empty"));
    expect(response.status).toBe(200);
    expect(schema.safeParse(await response.json()).success).toBe(true);
  });

  it("empty means no transactions and no goals", async () => {
    const transactions = await (await callRoute(getTransactions, "transactions", scenario("empty"))).json();
    const goals = await (await callRoute(getGoals, "goals", scenario("empty"))).json();
    expect(transactions.pagination.total).toBe(0);
    expect(goals.goals).toEqual([]);
  });

  it("edge puts a very long merchant and a very large amount first", async () => {
    const { transactions } = await (await callRoute(getTransactions, "transactions", scenario("edge"))).json();
    expect(transactions[0].merchant.length).toBeGreaterThanOrEqual(60);
    expect(transactions[0].amount).toBeGreaterThanOrEqual(1_000_000);
  });

  it("slow holds the answer for 12 seconds, past the app's 10-second limit", async () => {
    vi.useFakeTimers();
    let settled = false;
    const pending = callRoute(getProfile, "profile", scenario("slow")).then((response) => {
      settled = true;
      return response;
    });
    await vi.advanceTimersByTimeAsync(11_000);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1_000);
    expect((await pending).status).toBe(200);
  });
});
