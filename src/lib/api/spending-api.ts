import {
  type Categories,
  type Filters,
  type Goals,
  type Period,
  type Profile,
  type SortOrder,
  type Summary,
  type Transactions,
  type Trends,
  categoriesSchema,
  filtersSchema,
  goalsSchema,
  profileSchema,
  summarySchema,
  transactionsSchema,
  trendsSchema,
} from "@/schemas/api";
import { type FetchOptions, fetchJson } from "./client";

export const CUSTOMER_ID = "12345";

const BASE_PATH = `/api/customers/${CUSTOMER_ID}`;

export type CategoryRange = { period: Period } | { startDate: string; endDate: string };

export interface TransactionParams {
  limit: number;
  offset: number;
  sortBy: SortOrder;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionRequest {
  range: CategoryRange;
  limit: number;
  offset: number;
  sortBy: SortOrder;
  category?: string;
}

type QueryValues = Record<string, string | number | undefined>;

function withQuery(path: string, values: QueryValues): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) query.set(key, String(value));
  }
  return `${path}?${query.toString()}`;
}

export function getProfile(options?: FetchOptions): Promise<Profile> {
  return fetchJson(`${BASE_PATH}/profile`, profileSchema, options);
}

export function getSummary(period: Period, options?: FetchOptions): Promise<Summary> {
  return fetchJson(withQuery(`${BASE_PATH}/spending/summary`, { period }), summarySchema, options);
}

export function getCategories(range: CategoryRange, options?: FetchOptions): Promise<Categories> {
  return fetchJson(withQuery(`${BASE_PATH}/spending/categories`, range), categoriesSchema, options);
}

export function getTrends(months: number, options?: FetchOptions): Promise<Trends> {
  return fetchJson(withQuery(`${BASE_PATH}/spending/trends`, { months }), trendsSchema, options);
}

export function getTransactions(params: TransactionParams, options?: FetchOptions): Promise<Transactions> {
  return fetchJson(withQuery(`${BASE_PATH}/transactions`, { ...params }), transactionsSchema, options);
}

export function getGoals(options?: FetchOptions): Promise<Goals> {
  return fetchJson(`${BASE_PATH}/goals`, goalsSchema, options);
}

export function getFilters(options?: FetchOptions): Promise<Filters> {
  return fetchJson(`${BASE_PATH}/filters`, filtersSchema, options);
}
