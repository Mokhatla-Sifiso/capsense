import { z } from "zod";

const envSchema = z.object({
  MOCK_TODAY: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "MOCK_TODAY must be YYYY-MM-DD")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "MOCK_TODAY must be a real date")
    .default("2024-09-16"),
  MOCK_SCENARIOS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type ServerEnv = z.infer<typeof envSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return envSchema.parse({
    MOCK_TODAY: source.MOCK_TODAY || undefined,
    MOCK_SCENARIOS: source.MOCK_SCENARIOS || undefined,
  });
}
