import { type Page, expect, test } from "@playwright/test";

async function holdProfileRequests(page: Page) {
  const urls: string[] = [];
  await page.route("**/api/customers/*/profile", async (route) => {
    urls.push(route.request().url());
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.continue();
  });
  return urls;
}

test("Refresh asks each section again and keeps the address, history and scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/?period=90d&months=6&category=Dining&sort=amount_desc&page=2");
  await expect(page.getByText(/Updated \d{2}:\d{2}/)).toBeVisible();
  const address = page.url();
  const historyLength = await page.evaluate(() => history.length);
  await page.evaluate(() => window.scrollTo(0, 400));

  const profileRequests = await holdProfileRequests(page);
  await page.getByRole("button", { name: "Refresh data" }).evaluate((button) => button.focus({ preventScroll: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Refreshing data" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Refresh data" })).toBeVisible();

  expect(profileRequests).toHaveLength(1);
  expect(page.url()).toBe(address);
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  expect(await page.evaluate(() => window.scrollY)).toBe(400);
  await expect(page.getByRole("status").filter({ hasText: "Data refreshed" })).toBeAttached();
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the refresh icon doesn't spin", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.getByText(/Updated \d{2}:\d{2}/)).toBeVisible();
    await holdProfileRequests(page);
    await page.getByRole("button", { name: "Refresh data" }).click();
    const icon = page.getByRole("button", { name: "Refreshing data" }).locator("svg");
    expect(await icon.evaluate((svg) => getComputedStyle(svg).animationName)).toBe("none");
  });
});

test("on a phone, Refresh is a square icon button named 'Refresh data'", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const button = page.getByRole("button", { name: "Refresh data" });
  await expect(button).toBeVisible();
  await expect(button.getByText("Refresh", { exact: true })).toBeHidden();
  const box = await button.boundingBox();
  expect(box?.width).toBe(44);
  expect(box?.height).toBe(44);
});
