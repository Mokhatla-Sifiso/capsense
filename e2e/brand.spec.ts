import { expect, test } from "@playwright/test";

test("every request, fonts included, goes to the app itself and never to Google Fonts", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const origin = new URL(page.url()).origin;
  expect(requests.filter((url) => !url.startsWith(origin))).toEqual([]);
  expect(requests.filter((url) => url.endsWith(".woff2")).length).toBeGreaterThan(0);
});

test("the page follows the device theme until a theme is chosen", async ({ page }) => {
  const background = () => page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect.poll(background).toBe("rgb(244, 246, 250)");

  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(background).toBe("rgb(18, 22, 28)");

  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await expect.poll(background).toBe("rgb(244, 246, 250)");

  await page.emulateMedia({ colorScheme: "light" });
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await expect.poll(background).toBe("rgb(18, 22, 28)");
});
