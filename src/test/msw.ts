import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  specCategories,
  specFilters,
  specGoals,
  specProfile,
  specSummary,
  specTransactions,
  specTrends,
} from "./spec-samples";

export const specHandlers = [
  http.get("*/api/customers/:customerId/profile", () => HttpResponse.json(specProfile)),
  http.get("*/api/customers/:customerId/spending/summary", ({ request }) =>
    HttpResponse.json({
      ...specSummary,
      period: new URL(request.url).searchParams.get("period") ?? specSummary.period,
    }),
  ),
  http.get("*/api/customers/:customerId/spending/categories", () => HttpResponse.json(specCategories)),
  http.get("*/api/customers/:customerId/spending/trends", () => HttpResponse.json(specTrends)),
  http.get("*/api/customers/:customerId/transactions", () => HttpResponse.json(specTransactions)),
  http.get("*/api/customers/:customerId/goals", () => HttpResponse.json(specGoals)),
  http.get("*/api/customers/:customerId/filters", () => HttpResponse.json(specFilters)),
];

export const server = setupServer(...specHandlers);
