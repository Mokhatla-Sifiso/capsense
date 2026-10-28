import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const aboutDialog = (page: Page) => page.getByRole("dialog", { name: "About this demo" });

test("Help opens the window with focus inside, without a request, and Escape hands focus back", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Updated \d{2}:\d{2}/)).toBeVisible();
  const address = page.url();
  const historyLength = await page.evaluate(() => history.length);
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  const help = page.getByRole("button", { name: "Help" });
  await help.click();
  await expect(aboutDialog(page)).toBeVisible();
  await expect(aboutDialog(page)).toContainText("“Today” is fixed at Monday, 16 September 2024.");
  expect(await aboutDialog(page).evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(aboutDialog(page)).toBeHidden();
  await expect(help).toBeFocused();

  expect(requests).toEqual([]);
  expect(page.url()).toBe(address);
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
});

test("Learn more in the rail opens the same window, and Close hands focus back to it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const learnMore = page.getByRole("button", { name: "Learn more" });
  await learnMore.click();
  await expect(aboutDialog(page)).toBeVisible();
  await aboutDialog(page).getByRole("button", { name: "Close" }).click();
  await expect(aboutDialog(page)).toBeHidden();
  await expect(learnMore).toBeFocused();
});

test("on a 320 px phone the window fits, and its content scrolls inside it", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 420 });
  await page.goto("/");
  await page.getByRole("button", { name: "Help" }).click();
  await expect(aboutDialog(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(
    0,
  );
  const scrolls = await aboutDialog(page).evaluate(
    (dialog) => dialog.scrollHeight > dialog.clientHeight && getComputedStyle(dialog).overflowY === "auto",
  );
  expect(scrolls).toBe(true);
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the open window passes the accessibility scan in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await page.getByRole("button", { name: "Help" }).click();
    await expect(aboutDialog(page)).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
