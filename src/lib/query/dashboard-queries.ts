import { type QueryClient, keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  type CategoryRange,
  type TransactionRequest,
  getCategories,
  getFilters,
  getGoals,
  getProfile,
  getSummary,
  getTransactions,
  getTrends,
} from "@/lib/api/spending-api";
import type { Period } from "@/schemas/api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  profile: () => [...dashboardKeys.all, "profile"] as const,
  summary: (period: Period) => [...dashboardKeys.all, "summary", period] as const,
  categories: (range: CategoryRange) => [...dashboardKeys.all, "categories", range] as const,
  trends: (months: number) => [...dashboardKeys.all, "trends", months] as const,
  transactions: (request: TransactionRequest) => [...dashboardKeys.all, "transactions", request] as const,
  goals: () => [...dashboardKeys.all, "goals"] as const,
  filters: () => [...dashboardKeys.all, "filters"] as const,
};

async function datesFor(client: QueryClient, range: CategoryRange): Promise<{ startDate?: string; endDate?: string }> {
  if (!("period" in range)) return range;
  try {
    return (await client.fetchQuery(dashboardQueries.categories(range))).dateRange ?? {};
  } catch {
    return {};
  }
}

export const dashboardQueries = {
  profile: () => queryOptions({ queryKey: dashboardKeys.profile(), queryFn: ({ signal }) => getProfile({ signal }) }),
  summary: (period: Period) =>
    queryOptions({ queryKey: dashboardKeys.summary(period), queryFn: ({ signal }) => getSummary(period, { signal }) }),
  categories: (range: CategoryRange) =>
    queryOptions({
      queryKey: dashboardKeys.categories(range),
      queryFn: ({ signal }) => getCategories(range, { signal }),
    }),
  trends: (months: number) =>
    queryOptions({ queryKey: dashboardKeys.trends(months), queryFn: ({ signal }) => getTrends(months, { signal }) }),
  transactions: (request: TransactionRequest) =>
    queryOptions({
      queryKey: dashboardKeys.transactions(request),
      queryFn: async ({ client, signal }) => {
        const { range, ...page } = request;
        return getTransactions({ ...page, ...(await datesFor(client, range)) }, { signal });
      },
      placeholderData: keepPreviousData,
    }),
  goals: () => queryOptions({ queryKey: dashboardKeys.goals(), queryFn: ({ signal }) => getGoals({ signal }) }),
  filters: () => queryOptions({ queryKey: dashboardKeys.filters(), queryFn: ({ signal }) => getFilters({ signal }) }),
};
