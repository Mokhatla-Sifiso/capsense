import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const TRANSACTIONS = "**/api/customers/*/transactions?*";
const section = (page: Page) => page.getByRole("region", { name: "Transactions" });
const pages = (page: Page) => section(page).getByRole("navigation", { name: "Transaction pages" });
const merchants = (page: Page) => section(page).locator("tbody tr td:first-child .font-bold").allInnerTexts();

function bigList(offset: number) {
  const rows = Array.from({ length: 20 }, (_, index) => ({
    id: `txn_${offset + index + 1}`,
    date: "2024-09-16T14:30:00Z",
    merchant: `Shop ${offset + index + 1}`,
    category: "Groceries",
    amount: 100,
    description: "Groceries",
    paymentMethod: "Credit Card",
    icon: "shopping-cart",
    categoryColor: "#FF6B6B",
  }));
  return { transactions: rows, pagination: { total: 1250, limit: 20, offset, hasMore: offset + 20 < 1250 } };
}

async function serveBigList(page: Page, failOffset?: number) {
  let failed = false;
  await page.route(TRANSACTIONS, async (route) => {
    const offset = Number(new URL(route.request().url()).searchParams.get("offset"));
    if (offset === failOffset && !failed) {
      failed = true;
      await route.fulfill({ status: 500, json: {} });
    } else await route.fulfill({ json: bigList(offset) });
  });
}

test.use({ viewport: { width: 1280, height: 800 } });

test("on page 1 of 1 250 it says Showing 1–20 of 1 250 and Previous is off", async ({ page }) => {
  await serveBigList(page);
  await page.goto("/");
  await expect(pages(page).getByText(/^Showing 1–20 of 1\s250$/)).toBeVisible();
  await expect(pages(page).getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(pages(page).getByRole("button", { name: "Next" })).toBeEnabled();
});

test("Next loads rows 21–40 in place of 1–20, puts the page in the address, and focuses the first new row", async ({
  page,
}) => {
  await serveBigList(page);
  await page.goto("/");
  await expect.poll(() => merchants(page)).toHaveLength(20);
  const steps = await page.evaluate(() => history.length);
  await pages(page).getByRole("button", { name: "Next" }).click();
  await expect(pages(page).getByText(/^Showing 21–40 of 1\s250$/)).toBeVisible();
  const shown = await merchants(page);
  expect([shown.length, shown[0], shown.at(-1)]).toEqual([20, "Shop 21", "Shop 40"]);
  expect(new URL(page.url()).searchParams.get("page")).toBe("2");
  expect(await page.evaluate(() => history.length)).toBe(steps);
  await expect(section(page).locator("tbody tr").first()).toBeFocused();
  await pages(page).getByRole("button", { name: "Previous" }).click();
  await expect(pages(page).getByText(/^Showing 1–20 of 1\s250$/)).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBeNull();
});

test("if the next page fails, page 1 stays with a warning above it, and Retry loads page 2", async ({ page }) => {
  await serveBigList(page, 20);
  await page.goto("/");
  await expect.poll(() => merchants(page)).toHaveLength(20);
  await pages(page).getByRole("button", { name: "Next" }).click();
  await expect(section(page).getByText("Couldn't load page 2. Still showing page 1.")).toBeVisible();
  expect((await merchants(page))[0]).toBe("Shop 1");
  await section(page).getByRole("button", { name: "Retry" }).click();
  await expect(pages(page).getByText(/^Showing 21–40 of 1\s250$/)).toBeVisible();
  await expect(section(page).getByText(/Couldn't load page/)).toHaveCount(0);
});

test("a page past the end offers Back to first page", async ({ page }) => {
  await page.goto("/?page=40");
  const back = section(page).getByRole("button", { name: "Back to first page" });
  await expect(back).toBeVisible();
  await back.click();
  await expect(pages(page).getByText(/^Showing 1–20 of/)).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBeNull();
});

test("on a phone Previous and Next sit side by side across the full width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await serveBigList(page);
  await page.goto("/");
  const previous = await pages(page).getByRole("button", { name: "Previous" }).boundingBox();
  const next = await pages(page).getByRole("button", { name: "Next" }).boundingBox();
  const card = await section(page).boundingBox();
  expect(Math.abs((previous?.y ?? 0) - (next?.y ?? 1))).toBeLessThan(1);
  expect((previous?.width ?? 0) + (next?.width ?? 0)).toBeGreaterThan((card?.width ?? 0) - 80);
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the pages pass the accessibility scan in ${colorScheme} mode, with a failed page showing`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await serveBigList(page, 20);
    await page.goto("/");
    await expect.poll(() => merchants(page)).toHaveLength(20);
    await pages(page).getByRole("button", { name: "Next" }).click();
    await expect(section(page).getByText("Couldn't load page 2. Still showing page 1.")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
