import type { NextRequest } from "next/server";
import { respondFor } from "@/server/mock/respond";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/customers/[customerId]/profile">,
): Promise<Response> {
  return respondFor(ctx, (repository) => repository.profile());
}
