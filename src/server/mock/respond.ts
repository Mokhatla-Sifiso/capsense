import { parseServerEnv } from "@/lib/env";
import { currentRepository } from "./current-repository";
import { notFound, serverError } from "./responses";
import { SLOW_RESPONSE_MS, dataVariantFor, readScenario } from "./scenarios";
import type { SpendingRepository } from "./spending-repository";

export interface CustomerRouteContext {
  params: Promise<{ customerId: string }>;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function respondFor(
  request: Request,
  ctx: CustomerRouteContext,
  answer: (repository: SpendingRepository) => unknown,
): Promise<Response> {
  const scenario = readScenario(request.headers, parseServerEnv(process.env).MOCK_SCENARIOS);
  if (scenario === "error") return serverError();
  if (scenario === "slow") await wait(SLOW_RESPONSE_MS);

  const { customerId } = await ctx.params;
  const repository = currentRepository(dataVariantFor(scenario));
  if (!repository.hasCustomer(customerId)) return notFound();
  const result = answer(repository);
  return result instanceof Response ? result : Response.json(result);
}
