import { type QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import type { ReactNode } from "react";
import { server } from "@/test/msw";
import {
  specCategories,
  specFilters,
  specGoals,
  specProfile,
  specSummary,
  specTransactions,
  specTrends,
} from "@/test/spec-samples";
import { dashboardKeys, dashboardQueries } from "./dashboard-queries";
import { makeQueryClient } from "./query-client";

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={makeQueryClient()}>{children}</QueryClientProvider>;
}

describe("dashboard queries", () => {
  it("gives each set of parameters its own cache entry", () => {
    expect(dashboardKeys.summary("7d")).not.toEqual(dashboardKeys.summary("30d"));
    expect(dashboardKeys.categories({ period: "7d" })).not.toEqual(
      dashboardKeys.categories({ startDate: "2024-09-01", endDate: "2024-09-16" }),
    );
  });

  it.each([
    ["profile", (client: QueryClient) => client.fetchQuery(dashboardQueries.profile()), specProfile],
    ["summary", (client: QueryClient) => client.fetchQuery(dashboardQueries.summary("30d")), specSummary],
    [
      "categories",
      (client: QueryClient) => client.fetchQuery(dashboardQueries.categories({ period: "30d" })),
      specCategories,
    ],
    ["trends", (client: QueryClient) => client.fetchQuery(dashboardQueries.trends(12)), specTrends],
    [
      "transactions",
      (client: QueryClient) =>
        client.fetchQuery(
          dashboardQueries.transactions({ range: { period: "30d" }, limit: 20, offset: 0, sortBy: "date_desc" }),
        ),
      specTransactions,
    ],
    ["goals", (client: QueryClient) => client.fetchQuery(dashboardQueries.goals()), specGoals],
    ["filters", (client: QueryClient) => client.fetchQuery(dashboardQueries.filters()), specFilters],
  ] as const)("loads %s through the API client", async (_name, load, expected) => {
    await expect(load(makeQueryClient())).resolves.toEqual(expected);
  });

  it("keeps the current page on screen while the next one loads", async () => {
    let page = 1;
    server.use(
      http.get("*/api/customers/:customerId/transactions", async () => {
        if (page === 2) await delay(50);
        return HttpResponse.json(specTransactions);
      }),
    );
    const params = (offset: number) => ({
      range: { period: "30d" as const },
      limit: 20,
      offset,
      sortBy: "date_desc" as const,
    });
    const { result, rerender } = renderHook(({ offset }) => useQuery(dashboardQueries.transactions(params(offset))), {
      wrapper,
      initialProps: { offset: 0 },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    page = 2;
    rerender({ offset: 20 });
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data).toEqual(specTransactions);
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
  });

  it.each([
    [
      "the period's dates from the category breakdown",
      { period: "30d" as const },
      null,
      "&startDate=2024-08-16&endDate=2024-09-16",
    ],
    [
      "the custom dates as they are",
      { startDate: "2024-09-01", endDate: "2024-09-10" },
      null,
      "&startDate=2024-09-01&endDate=2024-09-10",
    ],
    ["no dates when the category breakdown fails", { period: "30d" as const }, 500, ""],
  ])("asks for transactions with %s", async (_case, range, categoriesStatus, dates) => {
    const asked: string[] = [];
    server.use(
      http.get("*/api/customers/:customerId/spending/categories", () =>
        categoriesStatus ? HttpResponse.json({}, { status: categoriesStatus }) : HttpResponse.json(specCategories),
      ),
      http.get("*/api/customers/:customerId/transactions", ({ request }) => {
        asked.push(new URL(request.url).search);
        return HttpResponse.json(specTransactions);
      }),
    );
    await makeQueryClient().fetchQuery(
      dashboardQueries.transactions({ range, limit: 20, offset: 0, sortBy: "date_desc" }),
    );
    expect(asked).toEqual([`?limit=20&offset=0&sortBy=date_desc${dates}`]);
  });

  it("surfaces a failure once, without retrying by itself", async () => {
    let calls = 0;
    server.use(
      http.get("*/api/customers/:customerId/goals", () => {
        calls += 1;
        return HttpResponse.json({}, { status: 500 });
      }),
    );
    const { result } = renderHook(() => useQuery(dashboardQueries.goals()), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(calls).toBe(1);
  });
});
