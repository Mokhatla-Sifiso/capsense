import {
  LIMIT,
  MONTHS,
  OFFSET,
  customWindow,
  isRealDay,
  readDateFilter,
  readPeriod,
  readSortOrder,
  readWholeNumber,
} from "./query";

describe("period and sort order fall back to the spec defaults", () => {
  it.each([
    [null, "30d"],
    ["90d", "90d"],
    ["2w", "30d"],
  ])("period %s → %s", (value, expected) => {
    expect(readPeriod(value)).toBe(expected);
  });

  it.each([
    [null, "date_desc"],
    ["amount_asc", "amount_asc"],
    ["price", "date_desc"],
  ])("sortBy %s → %s", (value, expected) => {
    expect(readSortOrder(value)).toBe(expected);
  });
});

describe("whole numbers are clamped, and anything else uses the default", () => {
  it.each([
    [null, 12],
    ["6", 6],
    ["30", 24],
    ["0", 1],
    ["-5", 1],
    ["abc", 12],
    ["2.5", 12],
  ])("months %s → %i", (value, expected) => {
    expect(readWholeNumber(value, MONTHS)).toBe(expected);
  });

  it.each([
    [null, 20],
    ["150", 100],
    ["0", 1],
    ["abc", 20],
    ["2.5", 20],
  ])("limit %s → %i", (value, expected) => {
    expect(readWholeNumber(value, LIMIT)).toBe(expected);
  });

  it.each([
    [null, 0],
    ["40", 40],
    ["-1", 0],
    ["1.5", 0],
  ])("offset %s → %i", (value, expected) => {
    expect(readWholeNumber(value, OFFSET)).toBe(expected);
  });
});

describe("dates", () => {
  it.each(["2024-09-16", "2024-02-29"])("accepts %s", (value) => {
    expect(isRealDay(value)).toBe(true);
  });

  it.each(["2024/09/01", "2024-02-30", "2023-02-29", "2024-13-01", "16-09-2024", ""])("rejects %s", (value) => {
    expect(isRealDay(value)).toBe(false);
  });

  it("passes valid dates through and treats missing ones as no filter", () => {
    expect(readDateFilter(new URLSearchParams("startDate=2024-09-01"))).toEqual({
      ok: true,
      filter: { startDate: "2024-09-01", endDate: null },
    });
  });

  it("explains which date is wrong", () => {
    expect(readDateFilter(new URLSearchParams("endDate=2024/09/01"))).toEqual({
      ok: false,
      message: "endDate must be a real date in YYYY-MM-DD format",
    });
  });

  it("refuses a start after the end", () => {
    expect(readDateFilter(new URLSearchParams("startDate=2024-09-10&endDate=2024-09-01")).ok).toBe(false);
  });

  it("only makes a custom range when both dates are given", () => {
    expect(customWindow({ startDate: "2024-09-01", endDate: "2024-09-16" })).toEqual({
      start: "2024-09-01",
      end: "2024-09-16",
    });
    expect(customWindow({ startDate: "2024-09-01", endDate: null })).toBeNull();
  });
});
