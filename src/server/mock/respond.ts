import { parseServerEnv } from "@/lib/env";
import { notFound, serverError } from "./responses";
import { SLOW_RESPONSE_MS, type Scenario, emptyData, extremeData, readScenario } from "./scenarios";
import { SpendingRepository, type SpendingData, mockData } from "./spending-repository";

export interface CustomerRouteContext {
  params: Promise<{ customerId: string }>;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function dataFor(today: string, scenario: Scenario | null): SpendingData {
  const data = mockData(today);
  if (scenario === "empty") return emptyData(data);
  if (scenario === "edge") return extremeData(data);
  return data;
}

export async function respondFor(
  request: Request,
  ctx: CustomerRouteContext,
  answer: (repository: SpendingRepository) => unknown,
): Promise<Response> {
  const env = parseServerEnv(process.env);
  const scenario = readScenario(request.headers, env.MOCK_SCENARIOS);
  if (scenario === "error") return serverError();
  if (scenario === "slow") await wait(SLOW_RESPONSE_MS);

  const { customerId } = await ctx.params;
  const repository = new SpendingRepository(dataFor(env.MOCK_TODAY, scenario));
  if (!repository.hasCustomer(customerId)) return notFound();
  const result = answer(repository);
  return result instanceof Response ? result : Response.json(result);
}
