import { expect, test } from "@playwright/test";

test.describe("side rail", () => {
  test("a rail link moves focus to its heading, in view, without changing the address or history", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const address = page.url();
    const historyLength = await page.evaluate(() => history.length);

    await page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("button", { name: "Monthly trends" })
      .click();

    const heading = page.getByRole("heading", { name: "Monthly trends" });
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport();
    expect(page.url()).toBe(address);
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
  });

  test("the rail stays in view while scrolling when it fits the screen", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.getByRole("navigation", { name: "On this page" })).toBeInViewport();
    await expect(page.getByRole("button", { name: "Learn more" })).toBeInViewport();
  });

  test("the rail scrolls with the page when the screen is too short for it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 560 });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.getByRole("navigation", { name: "On this page" })).not.toBeInViewport();
  });

  test("below 1280 px there is no rail and the logo is in the top bar", async ({ page }) => {
    await page.setViewportSize({ width: 1279, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "On this page" })).toBeHidden();
    await expect(page.getByRole("banner").getByRole("img", { name: "Capitec" })).toBeVisible();
  });

  test("in dark mode the logo sits on a white patch and loads unchanged", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const logo = page.getByRole("img", { name: "Capitec" }).first();
    await expect(logo).toBeVisible();
    const patch = await logo.evaluate((image) => getComputedStyle(image.parentElement ?? image).backgroundColor);
    expect(patch).toBe("rgb(255, 255, 255)");
    expect(await logo.getAttribute("src")).toBe("/brand/capitec-logo.svg");
  });
});
