import type { NextRequest } from "next/server";
import { customWindow, readDateFilter, readPeriod } from "@/server/mock/query";
import { respondFor } from "@/server/mock/respond";
import { badRequest } from "@/server/mock/responses";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/customers/[customerId]/spending/categories">,
): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const dates = readDateFilter(params);
  const period = readPeriod(params.get("period"));
  return respondFor(ctx, (repository) => {
    if (!dates.ok) return badRequest(dates.message);
    return repository.categories(customWindow(dates.filter) ?? repository.windowFor(period));
  });
}
