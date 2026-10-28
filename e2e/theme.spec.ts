import { type Page, expect, test } from "@playwright/test";

const LIGHT_WINDOW = "rgb(244, 246, 250)";
const DARK_WINDOW = "rgb(18, 22, 28)";

const background = (page: Page) => page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor);

const themeSwitch = (page: Page) => page.getByRole("radiogroup", { name: "Theme" }).locator("visible=true");

const pick = (page: Page, name: string) =>
  themeSwitch(page)
    .locator("label")
    .filter({ has: page.getByRole("radio", { name, exact: true }) })
    .click();

test("with nothing saved and the device in dark mode, the page starts dark and shows System", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  const html = await (await page.request.get("/")).text();
  expect(html.indexOf("capsense-theme")).toBeLessThan(html.indexOf("<body"));

  await page.goto("/");
  expect(await background(page)).toBe(DARK_WINDOW);
  await expect(themeSwitch(page).getByRole("radio", { name: "System" })).toBeChecked();
});

test("Light applies at once, survives a reload, and System hands back to the device", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  await pick(page, "Light");
  await expect.poll(() => background(page)).toBe(LIGHT_WINDOW);

  await page.reload();
  expect(await background(page)).toBe(LIGHT_WINDOW);
  await expect(themeSwitch(page).getByRole("radio", { name: "Light" })).toBeChecked();

  await pick(page, "System");
  await expect.poll(() => background(page)).toBe(DARK_WINDOW);
});

test("on System, a change to the device setting applies without a reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.getByText(/Updated \d{2}:\d{2}/)).toBeVisible();
  const navigations: string[] = [];
  page.on("framenavigated", (frame) => navigations.push(frame.url()));

  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => background(page)).toBe(DARK_WINDOW);
  expect(navigations).toEqual([]);
});

test("if the browser can't store anything, System applies and no error shows", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  expect(await background(page)).toBe(DARK_WINDOW);
  await pick(page, "Light");
  await expect.poll(() => background(page)).toBe(LIGHT_WINDOW);
  expect(errors).toEqual([]);
});

test("phones get a Theme row at the bottom; larger screens keep it in the top bar", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("radiogroup", { name: "Theme" })).toBeHidden();
  await expect(page.getByRole("main").getByRole("radiogroup", { name: "Theme" })).toBeVisible();

  await page.setViewportSize({ width: 768, height: 800 });
  await expect(page.getByRole("banner").getByRole("radiogroup", { name: "Theme" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("radiogroup", { name: "Theme" })).toBeHidden();
});
