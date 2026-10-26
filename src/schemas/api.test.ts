import {
  specCategories,
  specFilters,
  specGoals,
  specProfile,
  specSummary,
  specTransactions,
  specTrends,
} from "@/test/spec-samples";
import {
  categoriesSchema,
  filtersSchema,
  goalsSchema,
  profileSchema,
  summarySchema,
  transactionsSchema,
  trendsSchema,
} from "./api";

describe("API schemas accept the samples from the brief", () => {
  it.each([
    ["profile", profileSchema, specProfile],
    ["summary", summarySchema, specSummary],
    ["categories", categoriesSchema, specCategories],
    ["trends", trendsSchema, specTrends],
    ["transactions", transactionsSchema, specTransactions],
    ["goals", goalsSchema, specGoals],
    ["filters", filtersSchema, specFilters],
  ] as const)("%s", (_name, schema, sample) => {
    expect(schema.safeParse(sample).success).toBe(true);
  });
});

describe("API schemas reject data the screens can't trust", () => {
  it("rejects a missing required field", () => {
    const { currency: _currency, ...withoutCurrency } = specProfile;
    expect(profileSchema.safeParse(withoutCurrency).success).toBe(false);
  });

  it("rejects an amount sent as text", () => {
    const [first] = specTransactions.transactions;
    const broken = { ...specTransactions, transactions: [{ ...first, amount: "245.80" }] };
    expect(transactionsSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a period the spec doesn't define", () => {
    expect(summarySchema.safeParse({ ...specSummary, period: "2w" }).success).toBe(false);
  });

  it("rejects an impossible date", () => {
    expect(profileSchema.safeParse({ ...specProfile, joinDate: "2023-02-30" }).success).toBe(false);
  });

  it("drops fields the spec doesn't define", () => {
    const parsed = profileSchema.parse({ ...specProfile, internalNote: "not for the UI" });
    expect(parsed).toEqual(specProfile);
  });
});
