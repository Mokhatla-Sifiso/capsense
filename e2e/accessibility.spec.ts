import { type Page, expect, test } from "@playwright/test";

const WIDTHS = [320, 768, 1280, 1920] as const;

interface Stop {
  name: string;
  landmark: string;
  outline: boolean;
  covered: string | null;
}

async function settled(page: Page) {
  await page.waitForFunction(() => document.querySelectorAll('section[aria-busy="true"]').length === 0);
}

async function tabStops(page: Page): Promise<Stop[]> {
  const stops: Stop[] = [];
  for (let press = 0; press < 80; press += 1) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement) || element === document.body) return null;
      if (element.dataset.visited) return "again";
      element.dataset.visited = "yes";
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const x = Math.min(Math.max(box.left + box.width / 2, 0), innerWidth - 1);
      const y = Math.min(Math.max(box.top + box.height / 2, 0), innerHeight - 1);
      const hit = document.elementFromPoint(x, y);
      const radio = element instanceof HTMLInputElement && element.type === "radio";
      const target = radio ? (element.closest("label") ?? element) : element;
      const covered = hit && !target.contains(hit) && !hit.contains(target) ? hit.tagName.toLowerCase() : null;
      const landmark = element.closest("main") ? "main" : element.closest("header") ? "header" : "rail";
      const name = (element.getAttribute("aria-label") ?? element.textContent ?? "").trim().slice(0, 40);
      return { name, landmark, outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0, covered };
    });
    if (stop === "again") break;
    if (stop) stops.push(stop);
  }
  return stops;
}

test("the first Tab stop is a skip link that moves focus into the main content", async ({ page }) => {
  await page.goto("/");
  await settled(page);
  const address = page.url();
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.closest("main") !== null)).toBe(true);
  expect(page.url()).toBe(address);
});

for (const width of WIDTHS) {
  test(`at ${width} px every control is reached in order with a visible focus ring that nothing covers`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await settled(page);
    const stops = await tabStops(page);
    expect(stops[0]?.name).toBe("Skip to main content");
    const order = stops.slice(1).map((stop) => stop.landmark);
    const firstMain = order.indexOf("main");
    expect(order.slice(0, firstMain).every((landmark) => landmark !== "main")).toBe(true);
    expect(order.slice(firstMain).every((landmark) => landmark === "main")).toBe(true);
    expect(order.lastIndexOf("rail")).toBeLessThan(order.indexOf("header"));
    if (width >= 1280) expect(order[0]).toBe("rail");
    expect(stops.filter((stop) => !stop.outline).map((stop) => stop.name)).toEqual([]);
    expect(stops.filter((stop) => stop.covered).map((stop) => `${stop.name} under ${stop.covered}`)).toEqual([]);
  });

  test(`at ${width} px every tap target is at least ${width < 1280 ? 44 : 24} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await settled(page);
    const minimum = width < 1280 ? 44 : 24;
    const small = await page.evaluate((least) => {
      const targets = document.querySelectorAll<HTMLElement>(
        "a[href], button, select, input, textarea, [tabindex]:not([tabindex='-1'])",
      );
      return [...targets].flatMap((element) => {
        if (element.closest("[role='group'][aria-label='Monthly spending chart']")) return [];
        const radio = element instanceof HTMLInputElement && element.type === "radio";
        const target = radio ? (element.closest("label") ?? element) : element;
        const box = target.getBoundingClientRect();
        if (box.width === 0 || box.height === 0 || target.closest("[hidden], dialog:not([open])")) return [];
        if (box.width >= least && box.height >= least) return [];
        const name = (element.getAttribute("aria-label") ?? element.textContent ?? "").trim().slice(0, 40);
        return [`${name} ${Math.round(box.width)}×${Math.round(box.height)}`];
      });
    }, minimum);
    expect(small).toEqual([]);
    for (const name of ["Previous month", "Next month"]) {
      const box = await page.getByRole("button", { name }).boundingBox();
      expect(Math.min(box?.width ?? 0, box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    }
  });
}

test("the month buttons change the selected month and say which month it is", async ({ page }) => {
  await page.goto("/");
  const trends = page.getByRole("region", { name: "Monthly trends" });
  await trends.getByRole("button", { name: "Previous month" }).click();
  await expect(trends.getByRole("button", { name: /^August 2024:/ })).toHaveAttribute("aria-pressed", "true");
  await expect(trends.getByRole("status")).toHaveText(/^August 2024: R\s4\s174,50, 52 transactions, average R\s80,28$/);
});

test("no status or change is shown by colour alone", async ({ page }) => {
  await page.goto("/");
  await settled(page);
  const summary = page.getByRole("region", { name: "Spending summary" });
  await expect(summary.getByText(/^(Up|Down) [\d,]+% on previous period$/).first()).toBeVisible();
  for (const row of await page.getByRole("region", { name: "Spending by category" }).getByRole("listitem").all()) {
    await expect(row).toContainText(/[A-Za-z]{3,}/);
  }
  for (const goal of await page.getByRole("region", { name: "Spending goals" }).getByRole("article").all()) {
    await expect(goal).toContainText(/On track|Close to limit/);
  }
  const selected = page.getByRole("region", { name: "Monthly trends" }).locator("[aria-pressed='true']");
  await expect(selected).toHaveCount(1);
});
