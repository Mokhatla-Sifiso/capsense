import { expect, test } from "@playwright/test";

test.use({ timezoneId: "UTC" });

test("the top bar shows the demo date and, once loaded, the update time in South African time", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2024-09-16T14:05:00Z"));
  await page.goto("/");
  await expect(page.getByText("Data as of 16 Sep 2024 · Updated 16:05")).toBeVisible();
});

test("the About card gives the same demo date", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByText("Sample data, fixed to 16 Sep 2024. Read-only.")).toBeVisible();
});
