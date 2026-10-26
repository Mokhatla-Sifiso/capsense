import { parseServerEnv } from "@/lib/env";
import { createMockRepository, type SpendingRepository } from "./spending-repository";

let current: { today: string; repository: SpendingRepository } | undefined;

export function currentRepository(): SpendingRepository {
  const { MOCK_TODAY } = parseServerEnv(process.env);
  if (current?.today !== MOCK_TODAY) {
    current = { today: MOCK_TODAY, repository: createMockRepository(MOCK_TODAY) };
  }
  return current.repository;
}
