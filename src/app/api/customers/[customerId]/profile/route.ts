import type { NextRequest } from "next/server";
import { currentRepository } from "@/server/mock/current-repository";
import { notFound } from "@/server/mock/responses";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/customers/[customerId]/profile">,
): Promise<Response> {
  const { customerId } = await ctx.params;
  const repository = currentRepository();
  if (!repository.hasCustomer(customerId)) return notFound();
  return Response.json(repository.profile());
}
