import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  type CategoryRange,
  type TransactionParams,
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
  transactions: (params: TransactionParams) => [...dashboardKeys.all, "transactions", params] as const,
  goals: () => [...dashboardKeys.all, "goals"] as const,
  filters: () => [...dashboardKeys.all, "filters"] as const,
};

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
  transactions: (params: TransactionParams) =>
    queryOptions({
      queryKey: dashboardKeys.transactions(params),
      queryFn: ({ signal }) => getTransactions(params, { signal }),
      placeholderData: keepPreviousData,
    }),
  goals: () => queryOptions({ queryKey: dashboardKeys.goals(), queryFn: ({ signal }) => getGoals({ signal }) }),
  filters: () => queryOptions({ queryKey: dashboardKeys.filters(), queryFn: ({ signal }) => getFilters({ signal }) }),
};
