import { parseServerEnv } from "./env";

describe("parseServerEnv", () => {
  it("defaults to 2024-09-16 with scenarios off (ADR-003)", () => {
    expect(parseServerEnv({})).toEqual({ MOCK_TODAY: "2024-09-16", MOCK_SCENARIOS: false });
  });

  it("accepts an explicit date and enables scenarios only for 'true'", () => {
    expect(parseServerEnv({ MOCK_TODAY: "2024-03-31", MOCK_SCENARIOS: "true" })).toEqual({
      MOCK_TODAY: "2024-03-31",
      MOCK_SCENARIOS: true,
    });
  });

  it.each(["16-09-2024", "2024-13-40", "yesterday"])("rejects an invalid MOCK_TODAY: %s", (value) => {
    expect(() => parseServerEnv({ MOCK_TODAY: value })).toThrow();
  });

  it("rejects anything other than true/false for MOCK_SCENARIOS", () => {
    expect(() => parseServerEnv({ MOCK_SCENARIOS: "yes" })).toThrow();
  });
});
