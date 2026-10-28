import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const CATEGORIES = "**/api/customers/*/spending/categories?*";
const section = (page: Page) => page.getByRole("region", { name: "Spending by category" });
const readOuts = (page: Page) => section(page).getByRole("listitem").locator(".sr-only").allInnerTexts();

test("it lists the mock categories largest first, with the date range and the total", async ({ page }) => {
  await page.goto("/");
  await expect(section(page).getByText("18 Aug 2024 – 16 Sep 2024")).toBeVisible();
  await expect(section(page).getByText(/^R\s[\d\s]+,\d{2} total$/)).toBeVisible();
  const amounts = (await readOuts(page)).map((text) => Number(text.split(": R")[1]?.split(",")[0]?.replace(/\s/g, "")));
  expect(amounts.length).toBeGreaterThan(0);
  expect(amounts).toEqual(amounts.toSorted((a, b) => b - a));
});

test("it loads for Last 30 days, and reloads when Last 90 days is chosen", async ({ page }) => {
  const periods: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/spending/categories")) periods.push(url.searchParams.get("period") ?? "");
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(section(page).getByText("18 Aug 2024 – 16 Sep 2024")).toBeVisible();

  await page.getByRole("radiogroup", { name: "Period" }).getByText("Last 90 days").click();
  await expect(section(page).getByText("19 Jun 2024 – 16 Sep 2024")).toBeVisible();
  expect(periods).toEqual(["30d", "90d"]);
});

test("on a phone the share sits under the name and there's no ring", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const first = section(page).getByRole("listitem").first();
  await expect(first.getByText(/· \d+,\d%$/)).toBeVisible();
  await expect(first.locator("svg circle").first()).toBeHidden();
});

test("with no spending it shows the empty message", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-mock-scenario": "empty" });
  await page.goto("/");
  await expect(section(page).getByText("No category spending in this period")).toBeVisible();
  await expect(section(page).getByRole("list")).toHaveCount(0);
});

test("if the categories fail, only this card shows an error, and Retry brings them back", async ({ page }) => {
  await page.route(CATEGORIES, (route) => route.fulfill({ status: 500, json: {} }));
  await page.goto("/");
  await expect(section(page)).toContainText("Couldn't load categories");
  await expect(page.getByRole("region", { name: "Spending summary" })).toContainText("Transactions");
  await page.unroute(CATEGORIES);
  await section(page).getByRole("button", { name: "Retry" }).click();
  await expect(section(page).getByRole("listitem").first()).toBeVisible();
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the list passes the accessibility scan in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await expect(section(page).getByRole("listitem").first()).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
