import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const opener = (page: Page) => page.getByRole("button", { name: /^Custom range/ });
const dialog = (page: Page) => page.getByRole("dialog", { name: "Custom range" });
const categories = (page: Page) => page.getByRole("region", { name: "Spending by category" });
const summary = (page: Page) => page.getByRole("region", { name: "Spending summary" });

async function chooseDates(page: Page, from: string, to: string) {
  await opener(page).click();
  await dialog(page).getByLabel("From").fill(from);
  await dialog(page).getByLabel("To").fill(to);
  await dialog(page).getByRole("button", { name: "Apply" }).click();
}

test("a start after the end is explained, and the window stays open", async ({ page }) => {
  await page.goto("/");
  await chooseDates(page, "2024-09-10", "2024-09-01");
  await expect(dialog(page).getByRole("alert")).toHaveText("Start date must be on or before end date");
  await expect(dialog(page)).toBeVisible();
  expect(new URL(page.url()).searchParams.get("startDate")).toBeNull();
});

test("a valid range reloads the categories for those dates without a Back step", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const asked: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/spending/categories")) asked.push(url.search);
  });
  await page.goto("/?period=90d&page=2");
  await expect(categories(page).getByRole("listitem").first()).toBeVisible();
  const steps = await page.evaluate(() => history.length);

  await chooseDates(page, "2024-09-01", "2024-09-10");
  await expect(dialog(page)).toBeHidden();
  await expect(opener(page)).toHaveText("Custom: 1 Sep 2024 – 10 Sep 2024");
  await expect(categories(page).getByText("1 Sep 2024 – 10 Sep 2024", { exact: false })).toBeVisible();
  await expect(summary(page)).toHaveText("Summary is available for preset periods only");
  await expect(page.getByRole("radiogroup", { name: "Period" }).locator("input:checked")).toHaveCount(0);
  expect(asked.at(-1)).toBe("?startDate=2024-09-01&endDate=2024-09-10");
  await expect.poll(() => new URL(page.url()).search).toBe("?period=90d&startDate=2024-09-01&endDate=2024-09-10");
  expect(await page.evaluate(() => history.length)).toBe(steps);
});

test("Escape closes the window, returns focus and keeps the previous dates", async ({ page }) => {
  await page.goto("/?startDate=2024-09-01&endDate=2024-09-10");
  await opener(page).click();
  await expect(dialog(page).getByLabel("From")).toBeFocused();
  await dialog(page).getByLabel("From").fill("2024-08-01");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await expect(opener(page)).toBeFocused();
  await expect(opener(page)).toHaveText("Custom: 1 Sep 2024 – 10 Sep 2024");
  expect(new URL(page.url()).searchParams.get("startDate")).toBe("2024-09-01");
});

test("choosing a preset while custom dates are on clears them", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?startDate=2024-09-01&endDate=2024-09-10");
  await expect(opener(page)).toHaveText("Custom: 1 Sep 2024 – 10 Sep 2024");
  await page.getByRole("radiogroup", { name: "Period" }).getByText("Last 7 days").click();
  await expect(opener(page)).toHaveText("Custom range");
  await expect(summary(page).getByText("Transactions")).toBeVisible();
  await expect(categories(page).getByText("10 Sep 2024 – 16 Sep 2024", { exact: false })).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("startDate")).toBeNull();
});

test("with the keyboard, arrows change the preset without opening the window, and Enter opens it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const group = page.getByRole("radiogroup", { name: "Period" });
  await group.locator("input:checked").focus();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "Last 90 days" })).toBeChecked();
  await expect(dialog(page)).toBeHidden();
  await page.keyboard.press("Tab");
  await expect(opener(page)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog(page).getByLabel("From")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener(page)).toBeFocused();
});

test("on a phone the two dates are stacked", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await opener(page).click();
  const fromBox = await dialog(page).getByLabel("From").boundingBox();
  const toBox = await dialog(page).getByLabel("To").boundingBox();
  expect(toBox?.y).toBeGreaterThan((fromBox?.y ?? 0) + (fromBox?.height ?? 0));
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the window with an error passes the accessibility scan in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await chooseDates(page, "2024-09-10", "2024-09-01");
    await expect(dialog(page).getByRole("alert")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
