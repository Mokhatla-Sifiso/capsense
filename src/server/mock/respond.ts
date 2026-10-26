import { currentRepository } from "./current-repository";
import { notFound } from "./responses";
import type { SpendingRepository } from "./spending-repository";

export interface CustomerRouteContext {
  params: Promise<{ customerId: string }>;
}

export async function respondFor(
  ctx: CustomerRouteContext,
  answer: (repository: SpendingRepository) => unknown,
): Promise<Response> {
  const { customerId } = await ctx.params;
  const repository = currentRepository();
  if (!repository.hasCustomer(customerId)) return notFound();
  const result = answer(repository);
  return result instanceof Response ? result : Response.json(result);
}
