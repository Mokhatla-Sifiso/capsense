import type { NextRequest } from "next/server";
import { readPeriod } from "@/server/mock/query";
import { respondFor } from "@/server/mock/respond";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/customers/[customerId]/spending/summary">,
): Promise<Response> {
  const period = readPeriod(request.nextUrl.searchParams.get("period"));
  return respondFor(ctx, (repository) => repository.summary(period));
}
