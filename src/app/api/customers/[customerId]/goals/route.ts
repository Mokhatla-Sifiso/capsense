import type { NextRequest } from "next/server";
import { respondFor } from "@/server/mock/respond";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/customers/[customerId]/goals">,
): Promise<Response> {
  return respondFor(request, ctx, (repository) => repository.goals());
}
