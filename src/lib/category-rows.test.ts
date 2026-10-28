import { specCategories } from "@/test/spec-samples";
import { byAmount, rangeCaption, transactionsLabel, wholeShare } from "./category-rows";

const readable = (text: string) => text.replace(/ /g, " ");

describe("byAmount", () => {
  it("puts the biggest amount first, so Utilities comes before Shopping", () => {
    expect(byAmount(specCategories.categories).map((category) => category.name)).toEqual([
      "Groceries",
      "Entertainment",
      "Transportation",
      "Dining",
      "Utilities",
      "Shopping",
    ]);
  });

  it("orders equal amounts A to Z", () => {
    const row = { percentage: 50, transactionCount: 1, color: "#000000", icon: "tag" };
    const tied = [
      { ...row, name: "Beta", amount: 10 },
      { ...row, name: "Alpha", amount: 10 },
    ];
    expect(byAmount(tied).map((category) => category.name)).toEqual(["Alpha", "Beta"]);
  });
});

describe("wholeShare", () => {
  it.each([
    [29.4, "29%"],
    [20.9, "21%"],
    [100, "100%"],
    [0, "0%"],
    [0.4, "<1%"],
    [0.5, "1%"],
  ])("%s → %s", (percentage, expected) => {
    expect(wholeShare(percentage)).toBe(expected);
  });
});

describe("transactionsLabel", () => {
  it.each([
    [1, "1 transaction"],
    [15, "15 transactions"],
    [0, "0 transactions"],
    [12345, "12 345 transactions"],
  ])("%s → %s", (count, expected) => {
    expect(readable(transactionsLabel(count))).toBe(expected);
  });
});

describe("rangeCaption", () => {
  it("names both ends of the range", () => {
    expect(rangeCaption({ startDate: "2024-08-16", endDate: "2024-09-16" })).toBe("16 Aug 2024 – 16 Sep 2024");
  });

  it("names a single day once", () => {
    expect(rangeCaption({ startDate: "2024-09-16", endDate: "2024-09-16" })).toBe("16 Sep 2024");
  });

  it("is left out when there's no range", () => {
    expect(rangeCaption(undefined)).toBeNull();
  });
});
