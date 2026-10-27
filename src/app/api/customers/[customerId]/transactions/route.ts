import type { NextRequest } from "next/server";
import { LIMIT, OFFSET, readDateFilter, readSortOrder, readWholeNumber } from "@/server/mock/query";
import { respondFor } from "@/server/mock/respond";
import { badRequest } from "@/server/mock/responses";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/customers/[customerId]/transactions">,
): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const dates = readDateFilter(params);
  return respondFor(ctx, (repository) => {
    if (!dates.ok) return badRequest(dates.message);
    return repository.transactions({
      limit: readWholeNumber(params.get("limit"), LIMIT),
      offset: readWholeNumber(params.get("offset"), OFFSET),
      sortBy: readSortOrder(params.get("sortBy")),
      category: params.get("category"),
      ...dates.filter,
    });
  });
}
