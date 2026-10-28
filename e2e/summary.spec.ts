import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const SPEC_SUMMARY = {
  period: "30d",
  totalSpent: 4250.75,
  transactionCount: 47,
  averageTransaction: 90.44,
  topCategory: "Groceries",
  comparedToPrevious: { spentChange: 12.5, transactionChange: -3.2 },
};

const summaryCard = (page: Page) => page.getByRole("region", { name: "Spending summary" });
const valueOf = (page: Page, term: string) =>
  summaryCard(page).locator("dt", { hasText: term }).locator("xpath=following-sibling::dd[1]");

async function answerWithSpecSample(page: Page) {
  await page.route("**/api/customers/*/spending/summary?*", (route) => route.fulfill({ json: SPEC_SUMMARY }));
}

test("with the spec's sample data, it shows the four figures and both changes in words", async ({ page }) => {
  await answerWithSpecSample(page);
  await page.goto("/");
  await expect(valueOf(page, "Spent")).toHaveText("R 4 250,75");
  await expect(valueOf(page, "Transactions")).toHaveText("47");
  await expect(valueOf(page, "Average transaction")).toHaveText("R 90,44");
  await expect(valueOf(page, "Top category")).toHaveText("Groceries");
  await expect(summaryCard(page).getByText("Up 12,5% on previous period")).toBeVisible();
  await expect(summaryCard(page).getByText("Down 3,2% on previous period")).toBeVisible();
});

test("on a 1280 × 800 screen all four figures show without scrolling, before every other section", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  for (const term of ["Spent", "Transactions", "Average transaction", "Top category"]) {
    await expect(valueOf(page, term)).toBeInViewport({ ratio: 1 });
  }
  const comesFirst = await summaryCard(page).evaluate((card) => {
    const others = document.querySelectorAll("main section:not([aria-label='Spending summary'])");
    return [...others].every((other) => card.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(comesFirst).toBe(true);
});

test("it loads for Last 30 days, and reloads when Last 90 days is chosen", async ({ page }) => {
  const periods: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/spending/summary")) periods.push(url.searchParams.get("period") ?? "");
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(valueOf(page, "Spent · Last 30 days")).toBeVisible();

  await page.getByRole("radiogroup", { name: "Period" }).getByText("Last 90 days").click();
  await expect(valueOf(page, "Spent · Last 90 days")).toBeVisible();
  expect(periods).toEqual(["30d", "90d"]);
});

test("with no transactions it shows the empty version", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-mock-scenario": "empty" });
  await page.goto("/");
  await expect(valueOf(page, "Spent")).toHaveText("R 0,00");
  await expect(summaryCard(page).getByText("No spending in this period")).toBeVisible();
  await expect(valueOf(page, "Transactions")).toHaveText("0");
  await expect(valueOf(page, "Average transaction")).toHaveText("—");
  await expect(valueOf(page, "Top category")).toHaveText("—");
});

for (const width of [320, 360]) {
  test(`at ${width} px an amount over a million stays on one line, clear of the wallet tile`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.setExtraHTTPHeaders({ "x-mock-scenario": "edge" });
    await page.goto("/");
    const amount = valueOf(page, "Spent");
    await expect(amount).toHaveText(/^R\s\d\s\d{3}\s\d{3},\d{2}$/);
    const fits = await amount.evaluate((element) => element.scrollWidth <= element.clientWidth);
    expect(fits).toBe(true);
    const text = await amount.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect();
    });
    const tile = await summaryCard(page).locator(":scope > span[aria-hidden]").boundingBox();
    expect(text.height).toBeLessThan(60);
    expect(text.right).toBeLessThanOrEqual(tile?.x ?? 0);
  });
}

test("with custom dates it shows the preset-only note and no figures", async ({ page }) => {
  await page.goto("/?startDate=2024-09-01&endDate=2024-09-16");
  await expect(summaryCard(page)).toHaveText("Summary is available for preset periods only");
});

test("if the summary fails, only this card shows an error, and Retry brings it back", async ({ page }) => {
  await page.route("**/api/customers/*/spending/summary?*", (route) => route.fulfill({ status: 500, json: {} }));
  await page.goto("/");
  await expect(summaryCard(page)).toContainText("Couldn't load summary");
  await expect(page.getByText(/^Good (morning|afternoon|evening), John/)).toBeVisible();
  await page.unroute("**/api/customers/*/spending/summary?*");
  await summaryCard(page).getByRole("button", { name: "Retry" }).click();
  await expect(valueOf(page, "Spent")).toHaveText(/^R\s/);
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the card passes the accessibility scan in ${colorScheme} mode`, async ({ page }) => {
    await answerWithSpecSample(page);
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await expect(valueOf(page, "Spent")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const [width, shown] of [
  [360, false],
  [768, true],
  [1280, true],
] as const) {
  test(`the bank-card picture is ${shown ? "shown" : "hidden"} at ${width} px and never read out`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const picture = summaryCard(page).locator("img[src='/brand/capitec-logo.svg']");
    await expect(valueOf(page, "Spent")).toBeVisible();
    await expect(picture).toBeVisible({ visible: shown });
    expect(await summaryCard(page).ariaSnapshot()).not.toMatch(/4821|Capitec/i);
  });
}
