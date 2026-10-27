import { NextRequest } from "next/server";
import type { CustomerRouteContext } from "@/server/mock/respond";

export type CustomerRoute = (request: NextRequest, ctx: CustomerRouteContext) => Promise<Response>;

export interface RouteCall {
  customerId?: string;
  query?: string;
  headers?: Record<string, string>;
}

export function callRoute(route: CustomerRoute, path: string, call: RouteCall = {}): Promise<Response> {
  const { customerId = "12345", query = "", headers = {} } = call;
  const request = new NextRequest(`http://localhost/api/customers/${customerId}/${path}${query}`, { headers });
  return route(request, { params: Promise.resolve({ customerId }) });
}
