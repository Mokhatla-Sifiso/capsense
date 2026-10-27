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
