import { specTrends } from "@/test/spec-samples";
import { labelEvery, monthSlots, niceMax, showsYear } from "./trend-chart";

const month = (iso: string, totalSpent = 100) => ({
  month: iso,
  totalSpent,
  transactionCount: 1,
  averageTransaction: totalSpent,
});

describe("monthSlots", () => {
  it("puts the months in order", () => {
    const shuffled = specTrends.trends.toReversed();
    expect(monthSlots(shuffled).map((slot) => slot.month)).toEqual([
      "2024-01",
      "2024-02",
      "2024-03",
      "2024-04",
      "2024-05",
      "2024-06",
    ]);
  });

  it("leaves a gap for a missing month instead of showing zero", () => {
    const slots = monthSlots([month("2024-01"), month("2024-03")]);
    expect(slots.map((slot) => [slot.month, slot.trend === null])).toEqual([
      ["2024-01", false],
      ["2024-02", true],
      ["2024-03", false],
    ]);
  });

  it("crosses a year boundary", () => {
    expect(monthSlots([month("2023-12"), month("2024-01")]).map((slot) => slot.month)).toEqual(["2023-12", "2024-01"]);
  });

  it("is empty without months", () => {
    expect(monthSlots([])).toEqual([]);
  });
});

describe("niceMax", () => {
  it.each([
    [4250.75, 5000],
    [5000, 5000],
    [5001, 10000],
    [12000, 25000],
    [26000, 50000],
    [1250000, 2500000],
    [2400, 2500],
    [800, 1000],
    [0, 1],
  ])("%s → %s", (highest, expected) => {
    expect(niceMax(highest)).toBe(expected);
  });
});

describe("showsYear", () => {
  it("shows the year on the first column and on each January", () => {
    const slots = monthSlots([
      month("2023-10"),
      month("2023-11"),
      month("2023-12"),
      month("2024-01"),
      month("2024-02"),
    ]);
    expect(slots.map((_, index) => showsYear(slots, index))).toEqual([true, false, false, true, false]);
  });
});

describe("labelEvery", () => {
  it("labels every column when there's room, and thins them out when crowded", () => {
    expect(labelEvery(6, 600)).toBe(1);
    expect(labelEvery(12, 300)).toBe(2);
    expect(labelEvery(24, 300)).toBe(4);
    expect(labelEvery(12, 0)).toBe(1);
  });
});
