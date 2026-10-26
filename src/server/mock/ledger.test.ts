import { CATEGORIES, CUSTOMER } from "./catalogue";
import { generateLedger } from "./ledger";

const options = { categories: CATEGORIES, from: CUSTOMER.joinDate, to: "2024-09-16", seed: 12345 };

describe("generateLedger", () => {
  const ledger = generateLedger(options);

  it("produces exactly the same ledger every time", () => {
    expect(generateLedger(options)).toEqual(ledger);
  });

  it("only has transactions from the join date up to today", () => {
    const days = ledger.map((entry) => entry.day);
    expect(days.every((day) => day >= options.from && day <= options.to)).toBe(true);
  });

  it("keeps every time within South African daytime so the UTC date is the local date", () => {
    const hours = ledger.map((entry) => Number(entry.date.slice(11, 13)));
    expect(Math.min(...hours)).toBeGreaterThanOrEqual(4);
    expect(Math.max(...hours)).toBeLessThanOrEqual(18);
  });

  it("gives every transaction a unique id in date order", () => {
    expect(new Set(ledger.map((entry) => entry.id)).size).toBe(ledger.length);
    expect(ledger.map((entry) => entry.date)).toEqual([...ledger.map((entry) => entry.date)].sort());
  });

  it("looks like a real month of spending: roughly 30 to 60 transactions", () => {
    const september = ledger.filter((entry) => entry.day >= "2024-08-17");
    expect(september.length).toBeGreaterThan(30);
    expect(september.length).toBeLessThan(60);
  });

  it("only uses categories and merchants from the catalogue", () => {
    const merchantsByCategory = new Map(CATEGORIES.map((c) => [c.name, c.merchants.map((m) => m.name)]));
    for (const entry of ledger) {
      expect(merchantsByCategory.get(entry.category)).toContain(entry.merchant);
    }
  });
});
