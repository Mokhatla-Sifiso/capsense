import type { z } from "zod/mini";
import { GET as getFilters } from "@/app/api/customers/[customerId]/filters/route";
import { GET as getGoals } from "@/app/api/customers/[customerId]/goals/route";
import { GET as getProfile } from "@/app/api/customers/[customerId]/profile/route";
import { GET as getCategories } from "@/app/api/customers/[customerId]/spending/categories/route";
import { GET as getSummary } from "@/app/api/customers/[customerId]/spending/summary/route";
import { GET as getTrends } from "@/app/api/customers/[customerId]/spending/trends/route";
import { GET as getTransactions } from "@/app/api/customers/[customerId]/transactions/route";
import {
  categoriesSchema,
  filtersSchema,
  goalsSchema,
  profileSchema,
  summarySchema,
  transactionsSchema,
  trendsSchema,
} from "@/schemas/api";
import type { CustomerRoute } from "./routes";

export interface Endpoint {
  path: string;
  route: CustomerRoute;
  schema: z.ZodMiniType;
}

export const ENDPOINTS: readonly Endpoint[] = [
  { path: "profile", route: getProfile, schema: profileSchema },
  { path: "spending/summary", route: getSummary, schema: summarySchema },
  { path: "spending/categories", route: getCategories, schema: categoriesSchema },
  { path: "spending/trends", route: getTrends, schema: trendsSchema },
  { path: "transactions", route: getTransactions, schema: transactionsSchema },
  { path: "goals", route: getGoals, schema: goalsSchema },
  { path: "filters", route: getFilters, schema: filtersSchema },
];

export { getCategories, getFilters, getGoals, getProfile, getSummary, getTransactions, getTrends };
