import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const periodRadios = (page: Page) => page.getByRole("radiogroup", { name: "Period" });

test("with nothing chosen, Last 30 days is selected and the address stays clean", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(periodRadios(page).getByRole("radio", { name: "Last 30 days" })).toBeChecked();
  expect(new URL(page.url()).search).toBe("");
});

test("choosing Last 90 days clears custom dates, goes back to page 1 and adds no Back step", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?startDate=2024-09-01&endDate=2024-09-16&page=3&sort=amount_desc");
  await expect(page.getByRole("button", { name: "Custom range: 1 Sep 2024 – 16 Sep 2024" })).toBeVisible();
  await expect(periodRadios(page).getByRole("radio", { checked: true })).toHaveCount(0);
  const historyLength = await page.evaluate(() => history.length);

  await periodRadios(page).getByText("Last 90 days").click();

  await expect(page).toHaveURL(/\?sort=amount_desc&period=90d$/);
  await expect(periodRadios(page).getByRole("radio", { name: "Last 90 days" })).toBeChecked();
  await expect(page.getByRole("button", { name: "Custom range" })).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
});

test("the left and right arrows move between periods", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const lastThirty = periodRadios(page).getByRole("radio", { name: "Last 30 days" });
  await lastThirty.focus();
  await page.keyboard.press("ArrowRight");
  await expect(periodRadios(page).getByRole("radio", { name: "Last 90 days" })).toBeChecked();
  await expect(page).toHaveURL(/period=90d/);
  await page.keyboard.press("ArrowLeft");
  await expect(lastThirty).toBeChecked();
  await expect(page).toHaveURL(/\/$/);
});

test("on a 360 px phone the dropdown and the Custom range button are full width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const dropdown = page.getByRole("combobox", { name: "Period" });
  await expect(dropdown).toHaveValue("30d");
  const heading = await page.getByRole("heading", { name: "Spending insights" }).locator("..").boundingBox();
  const dropdownBox = await dropdown.boundingBox();
  const buttonBox = await page.getByRole("button", { name: "Custom range" }).boundingBox();
  expect(dropdownBox?.width).toBe(heading?.width);
  expect(buttonBox?.width).toBe(heading?.width);
  expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

  await dropdown.selectOption("7d");
  await expect(page).toHaveURL(/period=7d/);
});

for (const width of [360, 768, 1280, 1920]) {
  test(`at ${width} px there is exactly one period control`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(periodRadios(page).or(page.getByRole("combobox", { name: "Period" }))).toHaveCount(1);
  });
}

test("when the filters endpoint fails, the spec's four periods show without an error", async ({ page }) => {
  await page.route("**/api/customers/*/filters", (route) => route.fulfill({ status: 500, json: {} }));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(periodRadios(page)).toHaveText("Last 7 daysLast 30 daysLast 90 daysLast year");
  await expect(page.getByText(/Updated \d{2}:\d{2}$/)).toBeVisible();
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the period control passes the accessibility scan in ${colorScheme} mode, with custom dates on`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/?startDate=2024-09-01&endDate=2024-09-16");
    await expect(page.getByRole("button", { name: /^Custom range: / })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
