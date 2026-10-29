import { type Page, expect, test } from "@playwright/test";
import { expectNoAxeIssues } from "./axe";

const section = (page: Page) => page.getByRole("region", { name: "Transactions" });
const filters = (page: Page) => section(page).getByRole("group", { name: "Transaction filters" });
const address = (page: Page) => new URL(page.url()).searchParams;

function recordRequests(page: Page): URLSearchParams[] {
  const asked: URLSearchParams[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/transactions")) asked.push(url.searchParams);
  });
  return asked;
}

test.use({ viewport: { width: 1280, height: 800 } });

test("Amount: high to low reloads sorted by the highest amount, from page 1, without a Back step", async ({ page }) => {
  const asked = recordRequests(page);
  await page.goto("/?page=2");
  await expect(section(page).locator("tbody tr").first()).toBeVisible();
  const steps = await page.evaluate(() => history.length);
  await filters(page).getByRole("combobox", { name: "Sort" }).selectOption({ label: "Amount: high to low" });
  await expect.poll(() => asked.at(-1)?.get("sortBy")).toBe("amount_desc");
  expect(asked.at(-1)?.get("offset")).toBe("0");
  await expect
    .poll(async () => {
      const amounts = await section(page).locator("tbody tr td:last-child").allInnerTexts();
      const values = amounts.map((text) => Number(text.replace(/[^\d,]/g, "").replace(",", ".")));
      return values.length > 1 && values.every((value, index) => index === 0 || values[index - 1]! >= value);
    })
    .toBe(true);
  expect(await page.evaluate(() => history.length)).toBe(steps);
});

test("Dining with no results says nothing matches, and Clear filters brings everything back", async ({ page }) => {
  await page.route("**/api/customers/*/transactions?*", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("category") === "Dining") {
      await route.fulfill({
        json: { transactions: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } },
      });
    } else await route.continue();
  });
  await page.goto("/");
  await filters(page).getByRole("combobox", { name: "Category" }).selectOption("Dining");
  await expect(section(page).getByText("No transactions match these filters")).toBeVisible();
  await expect(section(page).getByText("Category: Dining")).toBeVisible();
  await section(page).getByRole("button", { name: "Clear filters" }).last().click();
  await expect(section(page).locator("tbody tr").first()).toBeVisible();
  await expect(section(page).getByRole("heading", { name: "Transactions" })).toBeFocused();
  await expect.poll(() => address(page).get("category")).toBeNull();
});

test("Clear filters clears the category and custom dates in one go, back to the last preset", async ({ page }) => {
  await page.goto("/?period=90d&category=Groceries&startDate=2024-09-01&endDate=2024-09-10&sort=amount_asc");
  await expect(section(page).getByText("Dates: 1 Sep 2024 – 10 Sep 2024")).toBeVisible();
  const steps = await page.evaluate(() => history.length);
  await section(page).getByRole("button", { name: "Clear filters" }).click();
  await expect.poll(() => new URL(page.url()).search).toBe("?period=90d&sort=amount_asc");
  await expect(
    page.getByRole("radiogroup", { name: "Period" }).getByRole("radio", { name: "Last 90 days" }),
  ).toBeChecked();
  await expect(page.getByRole("region", { name: "Spending summary" }).getByText("Transactions")).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(steps);
});

test("if the filters request fails, the category choice is hidden and sort and dates still work", async ({ page }) => {
  await page.route("**/api/customers/*/filters", (route) => route.fulfill({ status: 500, json: {} }));
  await page.goto("/");
  await expect(filters(page).getByRole("combobox", { name: "Sort" })).toBeVisible();
  await expect(filters(page).getByRole("combobox", { name: "Category" })).toHaveCount(0);
  await filters(page).getByRole("combobox", { name: "Sort" }).selectOption({ label: "Oldest first" });
  await expect.poll(() => address(page).get("sort")).toBe("date_asc");
  await filters(page).getByRole("button", { name: "Dates" }).click();
  await expect(page.getByRole("dialog", { name: "Custom range" })).toBeVisible();
});

test("Dates opens the custom dates window, applies to the list, and returns focus to Dates", async ({ page }) => {
  await page.goto("/");
  const dates = filters(page).getByRole("button", { name: "Dates" });
  await dates.click();
  const dialog = page.getByRole("dialog", { name: "Custom range" });
  await dialog.getByLabel("From").fill("2024-09-01");
  await dialog.getByLabel("To").fill("2024-09-10");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect(section(page).getByText("Dates: 1 Sep 2024 – 10 Sep 2024")).toBeVisible();
  await expect(dates).toBeFocused();
  await expect(page.getByRole("button", { name: "Custom range: 1 Sep 2024 – 10 Sep 2024" })).toBeVisible();
});

test("on a phone the choices are stacked full width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(filters(page).getByRole("combobox", { name: "Category" })).toBeVisible();
  const boxes = await Promise.all(
    [
      filters(page).getByRole("combobox", { name: "Category" }),
      filters(page).getByRole("combobox", { name: "Sort" }),
      filters(page).getByRole("button", { name: "Dates" }),
    ].map((control) => control.boundingBox()),
  );
  const section360 = await section(page).boundingBox();
  for (const [index, box] of boxes.entries()) {
    expect(box?.width).toBeGreaterThan((section360?.width ?? 0) - 80);
    if (index > 0) expect(box?.y).toBeGreaterThan((boxes[index - 1]?.y ?? 0) + (boxes[index - 1]?.height ?? 0) - 1);
  }
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the filters pass the accessibility scan in ${colorScheme} mode, with filters set`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/?category=Groceries&startDate=2024-09-01&endDate=2024-09-10");
    await expect(section(page).locator("tbody tr").first()).toBeVisible();
    await expectNoAxeIssues(page, testInfo);
  });
}
