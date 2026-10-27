import { formatCount, formatCurrency, formatDay, formatPercent } from "./format";

const NBSP = " ";
const readable = (text: string) => text.replaceAll(NBSP, "·");

describe("formatCurrency", () => {
  it.each([
    [1250.3, "R·1·250,30"],
    [0, "R·0,00"],
    [4250.75, "R·4·250,75"],
    [1_250_000, "R·1·250·000,00"],
    [-61.02, "-R·61,02"],
  ])("shows %d rand as %s", (amount, expected) => {
    expect(readable(formatCurrency(amount, "ZAR"))).toBe(expected);
  });

  it("shows other currencies by their code and never converts them", () => {
    expect(readable(formatCurrency(1250.3, "USD"))).toBe("USD·1·250,30");
  });

  it("never contains an ordinary space, so an amount can't wrap onto two lines", () => {
    expect(formatCurrency(1_250_000, "ZAR")).not.toMatch(/[  ]/);
  });
});

describe("formatPercent", () => {
  it.each([
    [65.03, "65,0%"],
    [12.5, "12,5%"],
    [-3.2, "-3,2%"],
    [100, "100,0%"],
  ])("shows %d as %s", (value, expected) => {
    expect(formatPercent(value)).toBe(expected);
  });
});

describe("formatCount", () => {
  it.each([
    [47, "47"],
    [1250, "1·250"],
  ])("shows %d as %s", (value, expected) => {
    expect(readable(formatCount(value))).toBe(expected);
  });
});

describe("formatDay", () => {
  it.each([
    ["2024-09-16", "16 Sep 2024"],
    ["2023-01-05", "5 Jan 2023"],
    ["2024-12-31", "31 Dec 2024"],
  ])("shows %s as %s, the same in every browser", (isoDay, expected) => {
    expect(formatDay(isoDay)).toBe(expected);
  });
});
