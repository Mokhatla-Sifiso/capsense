import { type Page, expect, test } from "@playwright/test";
import { expectNoAxeIssues } from "./axe";

const TRANSACTIONS = "**/api/customers/*/transactions?*";
const SAMPLE = {
  transactions: [
    {
      id: "txn_123456",
      date: "2024-09-16T14:30:00Z",
      merchant: "Pick n Pay",
      category: "Groceries",
      amount: 245.8,
      description: "Weekly groceries",
      paymentMethod: "Credit Card",
      icon: "shopping-cart",
      categoryColor: "#FF6B6B",
    },
  ],
  pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
};
const LONG_NAME = "The Extraordinarily Long Merchant Name For Testing Purposes!";

const section = (page: Page) => page.getByRole("region", { name: "Transactions" });
const visibleRows = (page: Page) => section(page).locator("tbody tr:visible, ul li:visible");

function recordRequests(page: Page): URLSearchParams[] {
  const asked: URLSearchParams[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/transactions")) asked.push(url.searchParams);
  });
  return asked;
}

test("the sample row reads merchant, description, category, payment method, date and amount", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.route(TRANSACTIONS, (route) => route.fulfill({ json: SAMPLE }));
  await page.goto("/");
  const cells = section(page).getByRole("row").nth(1).getByRole("cell");
  await expect(cells).toHaveText([
    "Pick n PayWeekly groceries",
    "Groceries · Credit Card",
    /^16 Sep 2024, 16:30$/,
    /^R\s245,80$/,
  ]);
});

test("on a 360 px phone the amount, date and time sit on the right and nothing is cut off", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.route(TRANSACTIONS, (route) => route.fulfill({ json: SAMPLE }));
  await page.goto("/");
  const row = section(page).getByRole("listitem").first();
  const name = await row.getByText("Pick n Pay").boundingBox();
  for (const text of [/^R\s245,80$/, "16 Sep 2024", "16:30"]) {
    const box = await row.getByText(text).boundingBox();
    expect(box?.x).toBeGreaterThan((name?.x ?? 0) + (name?.width ?? 0));
  }
  const cut = await row.evaluate((item) =>
    [...item.querySelectorAll("span")].some(
      (span) => !span.classList.contains("truncate") && span.scrollWidth > span.clientWidth + 1,
    ),
  );
  expect(cut).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

for (const width of [360, 1280]) {
  test(`at ${width} px a 60-character merchant is shortened on screen and read out in full`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const long = { ...SAMPLE, transactions: [{ ...SAMPLE.transactions[0], merchant: LONG_NAME }] };
    await page.route(TRANSACTIONS, (route) => route.fulfill({ json: long }));
    await page.goto("/");
    const name = visibleRows(page).first().getByText(LONG_NAME);
    expect(await name.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    expect(await name.evaluate((element) => getComputedStyle(element).textOverflow)).toBe("ellipsis");
    expect(await section(page).ariaSnapshot()).toContain(LONG_NAME);
  });
}

test("it loads page 1 for Last 30 days, and reloads for Last 90 days from page 1", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const asked = recordRequests(page);
  await page.goto("/?page=3");
  await expect(visibleRows(page).first()).toBeVisible();
  await page.getByRole("radiogroup", { name: "Period" }).getByText("Last 90 days").click();
  await expect.poll(() => asked.length).toBe(2);
  expect(asked.map((params) => [params.get("startDate"), params.get("offset")])).toEqual([
    ["2024-08-18", "40"],
    ["2024-06-19", "0"],
  ]);
});

test("tapping Groceries loads only Groceries transactions from page 1, with the period's dates", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const asked = recordRequests(page);
  await page.goto("/?page=2");
  await expect(visibleRows(page).first()).toBeVisible();
  await page
    .getByRole("region", { name: "Spending by category" })
    .getByRole("button", { name: /^Groceries:/ })
    .click();
  await expect.poll(() => asked.at(-1)?.get("category")).toBe("Groceries");
  const last = asked.at(-1);
  expect([last?.get("offset"), last?.get("startDate"), last?.get("endDate")]).toEqual([
    "0",
    "2024-08-18",
    "2024-09-16",
  ]);
  await expect
    .poll(async () => {
      const categories = await section(page).locator("tbody tr td:nth-child(2)").allInnerTexts();
      return categories.length > 0 && categories.every((text) => text.startsWith("Groceries"));
    })
    .toBe(true);
});

test("applying custom dates reloads the transactions for those dates from page 1", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const asked = recordRequests(page);
  await page.goto("/?page=2");
  await expect(visibleRows(page).first()).toBeVisible();
  await page.getByRole("button", { name: "Custom range" }).click();
  const dialog = page.getByRole("dialog", { name: "Custom range" });
  await dialog.getByLabel("From").fill("2024-09-01");
  await dialog.getByLabel("To").fill("2024-09-10");
  await dialog.getByRole("button", { name: "Apply" }).click();
  await expect.poll(() => asked.at(-1)?.get("startDate")).toBe("2024-09-01");
  expect([asked.at(-1)?.get("endDate"), asked.at(-1)?.get("offset")]).toEqual(["2024-09-10", "0"]);
  await expect
    .poll(async () => {
      const dates = await section(page).locator("tbody tr td:nth-child(3)").allInnerTexts();
      return dates.length > 0 && dates.every((text) => /^([1-9]|10) Sep 2024,/.test(text));
    })
    .toBe(true);
});

test("with no transactions it shows the empty message", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-mock-scenario": "empty" });
  await page.goto("/");
  await expect(section(page).getByText("No transactions in this period")).toBeVisible();
});

test("if the transactions fail, only this section shows an error, and Retry brings them back", async ({ page }) => {
  await page.route(TRANSACTIONS, (route) => route.fulfill({ status: 500, json: {} }));
  await page.goto("/");
  await expect(section(page)).toContainText("Couldn't load transactions");
  await expect(page.getByRole("region", { name: "Spending by category" }).getByRole("listitem").first()).toBeVisible();
  await page.unroute(TRANSACTIONS);
  await section(page).getByRole("button", { name: "Retry" }).click();
  await expect(visibleRows(page).first()).toBeVisible();
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the transactions pass the accessibility scan in ${colorScheme} mode`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await expect(visibleRows(page).first()).toBeVisible();
    await expectNoAxeIssues(page, testInfo);
  });
}
