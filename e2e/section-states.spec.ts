import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const SECTIONS = [
  { region: "Spending summary", block: "summary", empty: "No spending in this period" },
  { region: "Spending by category", block: "categories", empty: "No category spending in this period" },
  { region: "Monthly trends", block: "trends", empty: "No monthly spending to show" },
  { region: "Spending goals", block: "goals", empty: "No spending goals yet" },
  { region: "Transactions", block: "transactions", empty: "No transactions in this period" },
];

const region = (page: Page, name: string) => page.getByRole("region", { name });

async function settled(page: Page) {
  for (const { region: name } of SECTIONS) await expect(region(page, name)).not.toHaveAttribute("aria-busy", "true");
}

test("when everything fails, every section shows its own error with Retry, and the page still renders", async ({
  page,
}) => {
  await page.setExtraHTTPHeaders({ "x-mock-scenario": "error" });
  await page.goto("/");
  await expect(page.getByText("Couldn't load profile")).toBeVisible();
  for (const { region: name, block } of SECTIONS) {
    await expect(region(page, name)).toContainText(`Couldn't load ${block}`);
    await expect(region(page, name).getByRole("button", { name: "Retry" })).toBeVisible();
  }
  await expect(page.getByText("CapSense").filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Refresh data" })).toBeVisible();
});

test("with nothing to show, every section shows its empty message", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-mock-scenario": "empty" });
  await page.goto("/");
  for (const { region: name, empty } of SECTIONS) await expect(region(page, name)).toContainText(empty);
});

test("when the server is slow, each section says Still loading… after 5 seconds, then shows its error at 10", async ({
  page,
}) => {
  test.setTimeout(40_000);
  await page.setExtraHTTPHeaders({ "x-mock-scenario": "slow" });
  const started = Date.now();
  await page.goto("/");
  await expect(page.getByText("Still loading…")).toHaveCount(SECTIONS.length + 1, { timeout: 8_000 });
  expect(Date.now() - started).toBeGreaterThanOrEqual(4_500);
  for (const { region: name, block } of SECTIONS) {
    await expect(region(page, name)).toContainText(`Couldn't load ${block}`, { timeout: 12_000 });
  }
  await expect(page.getByText("Still loading…")).toHaveCount(0);
});

test("slow sections hold their size, so the page doesn't jump when the content arrives", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route("**/api/customers/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await route.continue();
  });
  await page.addInitScript(() => {
    const shifts: number[] = [];
    Object.assign(window, { layoutShifts: shifts });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) shifts.push(entry.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/");
  await settled(page);
  await page.waitForTimeout(500);
  const shift = await page.evaluate(() =>
    (window as unknown as { layoutShifts: number[] }).layoutShifts.reduce((sum, value) => sum + value, 0),
  );
  expect(shift).toBeLessThanOrEqual(0.1);
});

test("a summary whose total is text fails only the summary, and the rest of the page works", async ({ page }) => {
  await page.route("**/spending/summary?*", async (route) => {
    const response = await route.fetch();
    const body = (await response.json()) as Record<string, unknown>;
    await route.fulfill({ response, json: { ...body, totalSpent: String(body.totalSpent) } });
  });
  await page.goto("/");
  await expect(region(page, "Spending summary")).toContainText("Couldn't load summary");
  for (const { region: name, block } of SECTIONS.slice(1)) {
    await expect(region(page, name)).not.toHaveAttribute("aria-busy", "true");
    await expect(region(page, name)).not.toContainText(`Couldn't load ${block}`);
  }
});

test("a transaction whose amount is text is left out, and the other transactions still show", async ({ page }) => {
  await page.route("**/api/customers/*/transactions?*", async (route) => {
    const response = await route.fetch();
    const body = (await response.json()) as { transactions: Record<string, unknown>[] };
    const [first, ...rest] = body.transactions;
    await route.fulfill({ response, json: { ...body, transactions: [{ ...first, amount: "245.80" }, ...rest] } });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const rows = region(page, "Transactions").getByRole("table").getByRole("row");
  await expect(rows).toHaveCount(20);
  await expect(region(page, "Transactions")).not.toContainText("Couldn't load transactions");
});

test("Retry asks again for only the section that failed", async ({ page }) => {
  let failing = true;
  await page.route("**/spending/categories?*", (route) =>
    failing ? route.fulfill({ status: 500, json: {} }) : route.continue(),
  );
  await page.goto("/");
  await expect(region(page, "Spending by category")).toContainText("Couldn't load categories");
  await settled(page).catch(() => undefined);
  const asked: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/customers/")) asked.push(new URL(request.url()).pathname.split("/").at(-1) ?? "");
  });
  failing = false;
  await region(page, "Spending by category").getByRole("button", { name: "Retry" }).click();
  await expect(region(page, "Spending by category").getByRole("list")).toBeVisible();
  expect(asked).toEqual(["categories"]);
});

test("a section that fails to refresh keeps its data, says so, and Retry brings it up to date", async ({ page }) => {
  await page.goto("/");
  await settled(page);
  await expect(page.getByText(/Updated \d{2}:\d{2}/)).toBeVisible();
  let failing = true;
  await page.route("**/api/customers/*/goals", (route) =>
    failing ? route.fulfill({ status: 500, json: {} }) : route.continue(),
  );
  await page.getByRole("button", { name: "Refresh data" }).click();
  const goals = region(page, "Spending goals");
  await expect(goals).toContainText("Couldn't refresh goals. Showing earlier data.");
  await expect(goals.getByRole("article")).not.toHaveCount(0);
  await expect(page.getByText(/Updated \d{2}:\d{2} · 1 section couldn't refresh/)).toBeVisible();
  failing = false;
  await goals.getByRole("button", { name: "Retry" }).click();
  await expect(goals).not.toContainText("Couldn't refresh goals");
  await expect(page.getByText(/^Data as of/)).not.toContainText("couldn't refresh");
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`an error panel and a refresh strip pass the accessibility scan in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.route("**/spending/categories?*", (route) => route.fulfill({ status: 500, json: {} }));
    await page.goto("/");
    await expect(region(page, "Spending by category")).toContainText("Couldn't load categories");
    await expect(region(page, "Spending goals").getByRole("article")).not.toHaveCount(0);
    await page.route("**/api/customers/*/goals", (route) => route.fulfill({ status: 500, json: {} }));
    await page.getByRole("button", { name: "Refresh data" }).click();
    await expect(region(page, "Spending goals")).toContainText("Couldn't refresh goals");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
