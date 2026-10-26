import { parseServerEnv } from "@/lib/env";
import { applyVariant, type DataVariant } from "./scenarios";
import { SpendingRepository, mockData } from "./spending-repository";

const repositories = new Map<string, SpendingRepository>();

export function currentRepository(variant: DataVariant = "normal"): SpendingRepository {
  const { MOCK_TODAY } = parseServerEnv(process.env);
  const key = `${MOCK_TODAY}:${variant}`;
  const cached = repositories.get(key);
  if (cached) return cached;
  const repository = new SpendingRepository(applyVariant(mockData(MOCK_TODAY), variant));
  repositories.set(key, repository);
  return repository;
}
