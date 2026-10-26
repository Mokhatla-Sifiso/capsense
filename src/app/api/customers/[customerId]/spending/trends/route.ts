import type { NextRequest } from "next/server";
import { MONTHS, readWholeNumber } from "@/server/mock/query";
import { respondFor } from "@/server/mock/respond";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/customers/[customerId]/spending/trends">,
): Promise<Response> {
  const months = readWholeNumber(request.nextUrl.searchParams.get("months"), MONTHS);
  return respondFor(ctx, (repository) => repository.trends(months));
}
