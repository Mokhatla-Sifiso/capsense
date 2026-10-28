import { type Page, expect, test } from "@playwright/test";

const section = (page: Page) => page.getByRole("region", { name: "Transactions" });
const firstRow = (page: Page) => section(page).locator("tbody tr").first().locator(".font-bold").first();
const address = (page: Page) => new URL(page.url()).searchParams;
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

async function drillDown(page: Page) {
  await page.goto("/?period=1y");
  await expect(firstRow(page)).toBeVisible();
  await page.mouse.wheel(0, 300);
  await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
  const before = await scrollY(page);
  await page
    .getByRole("region", { name: "Spending by category" })
    .getByRole("button", { name: /^Dining:/ })
    .click();
  await expect.poll(() => address(page).get("category")).toBe("Dining");
  await section(page).getByRole("combobox", { name: "Sort" }).selectOption("amount_desc");
  await expect.poll(() => address(page).get("sort")).toBe("amount_desc");
  await section(page).getByRole("button", { name: "Next" }).click();
  await expect(section(page).getByText(/^Showing 21–/)).toBeVisible();
  return before;
}

test.use({ viewport: { width: 1280, height: 800 } });

test("Back goes to before the drill-down, Forward returns to Dining page 2 in place, and reload starts at the top", async ({
  page,
}) => {
  const before = await drillDown(page);
  await page.mouse.wheel(0, 900);
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before);
  const deep = await scrollY(page);
  const deepRow = await firstRow(page).innerText();

  await page.goBack();
  await expect.poll(() => address(page).get("category")).toBeNull();
  expect([address(page).get("sort"), address(page).get("page")]).toEqual([null, null]);
  await expect.poll(() => scrollY(page)).toBe(before);

  await page.goForward();
  await expect(section(page).getByText(/^Showing 21–40/)).toBeVisible();
  expect([address(page).get("category"), address(page).get("sort"), address(page).get("page")]).toEqual([
    "Dining",
    "amount_desc",
    "2",
  ]);
  await expect(firstRow(page)).toHaveText(deepRow);
  await expect.poll(() => scrollY(page)).toBe(deep);

  await page.reload();
  await expect(section(page).getByText(/^Showing 21–40/)).toBeVisible();
  await expect(section(page).getByRole("combobox", { name: "Sort" })).toHaveValue("amount_desc");
  await page.waitForTimeout(1000);
  expect(await scrollY(page)).toBe(0);
  const stored = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }));
  expect(stored.session).toEqual([]);
  expect(stored.local.every((key) => key === "theme")).toBe(true);
});

test("only the drill-down adds a Back step; sort, page and period changes replace it", async ({ page }) => {
  await page.goto("/?period=1y");
  await expect(firstRow(page)).toBeVisible();
  const start = await page.evaluate(() => history.length);
  await page
    .getByRole("region", { name: "Spending by category" })
    .getByRole("button", { name: /^Dining:/ })
    .click();
  await expect.poll(() => address(page).get("category")).toBe("Dining");
  for (const sort of ["amount_desc", "date_asc", "amount_asc"]) {
    await section(page).getByRole("combobox", { name: "Sort" }).selectOption(sort);
    await expect.poll(() => address(page).get("sort")).toBe(sort);
  }
  await section(page).getByRole("button", { name: "Next" }).click();
  await expect.poll(() => address(page).get("page")).toBe("2");
  expect(await page.evaluate(() => history.length)).toBe(start + 1);
  await page.goBack();
  await expect.poll(() => address(page).get("category")).toBeNull();
  await page.goForward();
  await expect
    .poll(() => [address(page).get("category"), address(page).get("sort"), address(page).get("page")])
    .toEqual(["Dining", "amount_asc", "2"]);
});

test("invalid values in the address fall back to the defaults and keep the rest", async ({ page }) => {
  const asked: URLSearchParams[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/transactions")) asked.push(url.searchParams);
  });
  await page.goto("/?sort=price&page=-3&category=Dining");
  await expect(section(page).getByRole("combobox", { name: "Sort" })).toHaveValue("date_desc");
  await expect(section(page).getByRole("combobox", { name: "Category" })).toHaveValue("Dining");
  await expect.poll(() => asked.length).toBeGreaterThan(0);
  expect([asked[0]?.get("sortBy"), asked[0]?.get("offset"), asked[0]?.get("category")]).toEqual([
    "date_desc",
    "0",
    "Dining",
  ]);
});

test("a category that's no longer available is cleared, with a note", async ({ page }) => {
  await page.goto("/?category=Pets");
  await expect(section(page).getByRole("status")).toHaveText(
    "“Pets” is no longer available, so all categories are shown",
  );
  await expect.poll(() => address(page).get("category")).toBeNull();
  await expect(section(page).getByRole("combobox", { name: "Category" })).toHaveValue("");
  await expect(firstRow(page)).toBeVisible();
});

test("nothing personal is in the address or storage, and nothing is sent to the server", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") writes.push(`${request.method()} ${request.url()}`);
  });
  const addresses: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) addresses.push(frame.url());
  });
  await drillDown(page);
  await page.goBack();
  await page.goForward();
  await page.reload();
  await expect(firstRow(page)).toBeVisible();
  addresses.push(page.url());
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  for (const secret of ["12345", "John Doe", "john.doe@email.com"]) {
    expect(addresses.some((url) => decodeURIComponent(url).includes(secret))).toBe(false);
    expect(stored.includes(secret)).toBe(false);
  }
  expect(writes).toEqual([]);
});

test("left alone for 5 minutes, then losing and regaining focus, the list stays put", async ({ page }) => {
  await page.clock.install();
  await page.goto("/?period=1y");
  await expect(firstRow(page)).toBeVisible();
  await section(page).locator("tbody tr").nth(14).scrollIntoViewIfNeeded();
  const rows = await section(page).locator("tbody tr").allInnerTexts();
  const y = await scrollY(page);
  let requests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.includes("/api/")) requests += 1;
  });
  await page.clock.fastForward("05:00");
  await page.evaluate(() => {
    window.dispatchEvent(new Event("blur"));
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
  });
  await page.waitForTimeout(500);
  expect(requests).toBe(0);
  expect(await section(page).locator("tbody tr").allInnerTexts()).toEqual(rows);
  expect(await scrollY(page)).toBe(y);
});
