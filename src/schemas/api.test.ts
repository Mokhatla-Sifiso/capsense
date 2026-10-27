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
    expect(summarySchema.safeParse({ ...specSummary, totalSpent: "4250.75" }).success).toBe(false);
  });

  it("rejects a list that isn't a list", () => {
    expect(transactionsSchema.safeParse({ ...specTransactions, transactions: "none" }).success).toBe(false);
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

describe("one bad item in a list is left out and the rest still show", () => {
  it("drops a transaction whose amount is text", () => {
    const [first] = specTransactions.transactions;
    const broken = { ...first, id: "txn_broken", amount: "245.80" };
    const parsed = transactionsSchema.parse({ ...specTransactions, transactions: [broken, first] });
    expect(parsed.transactions).toEqual([first]);
  });

  it("drops a goal with a missing field", () => {
    const [first] = specGoals.goals;
    const { status: _status, ...withoutStatus } = { ...first };
    const parsed = goalsSchema.parse({ goals: [withoutStatus, first] });
    expect(parsed.goals).toEqual([first]);
  });

  it("keeps an empty list when every item is bad", () => {
    expect(trendsSchema.parse({ trends: [null, 42] }).trends).toEqual([]);
  });
});
