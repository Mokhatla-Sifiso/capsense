import { NextRequest } from "next/server";
import type { z } from "zod";
import { filtersSchema, goalsSchema, profileSchema } from "@/schemas/api";
import type { CustomerRouteContext } from "@/server/mock/respond";
import { GET as getFilters } from "./[customerId]/filters/route";
import { GET as getGoals } from "./[customerId]/goals/route";
import { GET as getProfile } from "./[customerId]/profile/route";

type Handler = (request: NextRequest, ctx: CustomerRouteContext) => Promise<Response>;

const endpoints: [string, Handler, z.ZodType][] = [
  ["profile", getProfile, profileSchema],
  ["goals", getGoals, goalsSchema],
  ["filters", getFilters, filtersSchema],
];

function call(handler: Handler, path: string, customerId: string): Promise<Response> {
  const request = new NextRequest(`http://localhost/api/customers/${customerId}/${path}`);
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
