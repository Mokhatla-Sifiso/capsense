import { NextRequest } from "next/server";
import type { z } from "zod";
import { filtersSchema, goalsSchema, profileSchema, summarySchema, trendsSchema } from "@/schemas/api";
import type { CustomerRouteContext } from "@/server/mock/respond";
import { GET as getFilters } from "./[customerId]/filters/route";
import { GET as getGoals } from "./[customerId]/goals/route";
import { GET as getProfile } from "./[customerId]/profile/route";
import { GET as getSummary } from "./[customerId]/spending/summary/route";
import { GET as getTrends } from "./[customerId]/spending/trends/route";

type Handler = (request: NextRequest, ctx: CustomerRouteContext) => Promise<Response>;

const endpoints: [string, Handler, z.ZodType][] = [
  ["profile", getProfile, profileSchema],
  ["spending/summary", getSummary, summarySchema],
  ["spending/trends", getTrends, trendsSchema],
  ["goals", getGoals, goalsSchema],
  ["filters", getFilters, filtersSchema],
];

function call(handler: Handler, path: string, customerId: string, query = ""): Promise<Response> {
  const request = new NextRequest(`http://localhost/api/customers/${customerId}/${path}${query}`);
  return handler(request, { params: Promise.resolve({ customerId }) });
}

describe.each(endpoints)("GET /api/customers/{customerId}/%s", (path, handler, schema) => {
  it("answers 200 with exactly the fields in the spec", async () => {
    const response = await call(handler, path, "12345");
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(schema.parse(body)).toEqual(body);
  });

  it("answers 404 for a customer that doesn't exist", async () => {
    const response = await call(handler, path, "99999");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found", message: "Customer not found" });
  });
});

describe("query parameters reach the repository", () => {
  async function body(handler: Handler, path: string, query: string) {
    return (await call(handler, path, "12345", query)).json();
  }

  it("summary uses the period asked for and 30d for anything unknown", async () => {
    expect((await body(getSummary, "spending/summary", "?period=7d")).period).toBe("7d");
    expect((await body(getSummary, "spending/summary", "?period=2w")).period).toBe("30d");
  });

  it("trends returns 12 months by default and at most 24", async () => {
    expect((await body(getTrends, "spending/trends", "")).trends).toHaveLength(12);
    expect((await body(getTrends, "spending/trends", "?months=3")).trends).toHaveLength(3);
    expect((await body(getTrends, "spending/trends", "?months=30")).trends).toHaveLength(21);
  });
});
