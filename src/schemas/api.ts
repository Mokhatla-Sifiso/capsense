import { z } from "zod";

export const PERIODS = ["7d", "30d", "90d", "1y"] as const;
export const SORT_ORDERS = ["date_desc", "date_asc", "amount_desc", "amount_asc"] as const;

export type Period = (typeof PERIODS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

const isoDay = z.iso.date();
const count = z.number().int().nonnegative();

export const profileSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  email: z.string(),
  joinDate: isoDay,
  accountType: z.string(),
  totalSpent: z.number(),
  currency: z.string(),
});

export const summarySchema = z.object({
  period: z.enum(PERIODS),
  totalSpent: z.number(),
  transactionCount: count,
  averageTransaction: z.number(),
  topCategory: z.string(),
  comparedToPrevious: z.object({
    spentChange: z.number(),
    transactionChange: z.number(),
  }),
});

export const categorySpendSchema = z.object({
  name: z.string(),
  amount: z.number(),
  percentage: z.number(),
  transactionCount: count,
  color: z.string(),
  icon: z.string(),
});

export const categoriesSchema = z.object({
  dateRange: z.object({ startDate: isoDay, endDate: isoDay }),
  totalAmount: z.number(),
  categories: z.array(categorySpendSchema),
});

export const monthlyTrendSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  totalSpent: z.number(),
  transactionCount: count,
  averageTransaction: z.number(),
});

export const trendsSchema = z.object({ trends: z.array(monthlyTrendSchema) });

export const transactionSchema = z.object({
  id: z.string(),
  date: z.iso.datetime(),
  merchant: z.string(),
  category: z.string(),
  amount: z.number(),
  description: z.string(),
  paymentMethod: z.string(),
  icon: z.string(),
  categoryColor: z.string(),
});

export const transactionsSchema = z.object({
  transactions: z.array(transactionSchema),
  pagination: z.object({
    total: count,
    limit: count,
    offset: count,
    hasMore: z.boolean(),
  }),
});

export const goalSchema = z.object({
  id: z.string(),
  category: z.string(),
  monthlyBudget: z.number(),
  currentSpent: z.number(),
  percentageUsed: z.number(),
  daysRemaining: count,
  status: z.string(),
});

export const goalsSchema = z.object({ goals: z.array(goalSchema) });

export const filtersSchema = z.object({
  categories: z.array(z.object({ name: z.string(), color: z.string(), icon: z.string() })),
  dateRangePresets: z.array(z.object({ label: z.string(), value: z.string() })),
});

export type Profile = z.infer<typeof profileSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type CategorySpend = z.infer<typeof categorySpendSchema>;
export type Categories = z.infer<typeof categoriesSchema>;
export type MonthlyTrend = z.infer<typeof monthlyTrendSchema>;
export type Trends = z.infer<typeof trendsSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Transactions = z.infer<typeof transactionsSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type Goals = z.infer<typeof goalsSchema>;
export type Filters = z.infer<typeof filtersSchema>;
