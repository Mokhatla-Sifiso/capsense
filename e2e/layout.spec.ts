import { type Page, expect, test } from "@playwright/test";

const SECTIONS = ["Spending summary", "Spending by category", "Monthly trends", "Spending goals", "Transactions"];

async function boxes(page: Page) {
  const found: Record<string, { left: number; right: number; top: number }> = {};
  for (const name of SECTIONS) {
    const box = await page.getByRole("region", { name }).boundingBox();
    if (!box) throw new Error(`${name} is not on screen`);
    found[name] = { left: box.x, right: box.x + box.width, top: box.y };
  }
  return found;
}

const sideways = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe("page layout", () => {
  for (const width of [320, 360, 640, 768, 1280, 1920]) {
    test(`has no sideways scrolling at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      expect(await sideways(page)).toBe(0);
    });
  }

  for (const width of [360, 640, 768]) {
    test(`stacks every section in one column at ${width} px, with no rail`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const at = await boxes(page);
      const tops = SECTIONS.map((name) => at[name]?.top ?? 0);
      expect(tops).toEqual([...tops].sort((a, b) => a - b));
      expect(new Set(SECTIONS.map((name) => at[name]?.left)).size).toBe(1);
      await expect(page.getByRole("navigation", { name: "On this page" })).toBeHidden();
    });
  }

  test("on a laptop, trends and goals sit in the side column and transactions spans the full width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const at = await boxes(page);
    const summary = at["Spending summary"];
    const trends = at["Monthly trends"];
    const goals = at["Spending goals"];
    const transactions = at.Transactions;
    if (!summary || !trends || !goals || !transactions) throw new Error("A section is missing");
    expect(trends.left).toBeGreaterThan(summary.right);
    expect(goals.left).toBe(trends.left);
    expect(transactions.left).toBe(summary.left);
    expect(transactions.right).toBe(trends.right);
    await expect(page.getByRole("navigation", { name: "On this page" })).toBeAttached();
  });

  test("on a wide screen, transactions sit in the main column under the categories", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto("/");
    const at = await boxes(page);
    const categories = at["Spending by category"];
    const transactions = at.Transactions;
    const trends = at["Monthly trends"];
    if (!categories || !transactions || !trends) throw new Error("A section is missing");
    expect(transactions.left).toBe(categories.left);
    expect(transactions.right).toBe(categories.right);
    expect(transactions.top).toBeGreaterThan(categories.top);
    expect(transactions.right).toBeLessThan(trends.left);
  });

  test("Back and Forward return to the same scroll position", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 700 });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 900));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(900);
    await page.goto("/?months=6");
    await page.goBack();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(900);
    await page.goForward();
    await page.goBack();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(900);
  });
});
