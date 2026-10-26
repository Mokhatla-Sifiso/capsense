import { averageRands, percentChange, percentOf, sharesOfTotal, toRands } from "./money";

describe("money", () => {
  it("converts cents to rands", () => {
    expect(toRands(425_075)).toBe(4250.75);
  });

  it("averages to the nearest cent and treats no transactions as zero", () => {
    expect(averageRands(425_075, 47)).toBe(90.44);
    expect(averageRands(0, 0)).toBe(0);
  });

  it("reports change to one decimal and zero when there is nothing to compare with", () => {
    expect(percentChange(112_500, 100_000)).toBe(12.5);
    expect(percentChange(48, 50)).toBe(-4);
    expect(percentChange(500, 0)).toBe(0);
  });

  it("gives a percentage to two decimals", () => {
    expect(percentOf(65_030, 100_000)).toBe(65.03);
    expect(percentOf(10, 0)).toBe(0);
  });

  it("splits shares so they always add up to exactly 100", () => {
    const shares = sharesOfTotal([1, 1, 1]);
    expect(shares).toEqual([33.4, 33.3, 33.3]);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(100, 10);
  });

  it("gives every share zero when nothing was spent", () => {
    expect(sharesOfTotal([0, 0])).toEqual([0, 0]);
  });
});
