import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const TRENDS = "**/api/customers/*/spending/trends?*";
const SPEC = {
  trends: [
    { month: "2024-01", totalSpent: 3890.25, transactionCount: 42, averageTransaction: 92.62 },
    { month: "2024-02", totalSpent: 4150.8, transactionCount: 38, averageTransaction: 109.23 },
    { month: "2024-03", totalSpent: 3750.6, transactionCount: 45, averageTransaction: 83.35 },
    { month: "2024-04", totalSpent: 4200.45, transactionCount: 39, averageTransaction: 107.7 },
    { month: "2024-05", totalSpent: 3980.3, transactionCount: 44, averageTransaction: 90.46 },
    { month: "2024-06", totalSpent: 4250.75, transactionCount: 47, averageTransaction: 90.44 },
  ],
};

const section = (page: Page) => page.getByRole("region", { name: "Monthly trends" });
const chart = (page: Page) => section(page).getByRole("group", { name: "Monthly spending chart" });
const column = (page: Page, month: string) => chart(page).getByRole("button", { name: new RegExp(`^${month}:`) });

test("with 6 months there are 6 columns, January to June, and June is selected with its total", async ({ page }) => {
  await page.route(TRENDS, (route) => route.fulfill({ json: SPEC }));
  await page.goto("/");
  await expect(chart(page).getByRole("button")).toHaveCount(6);
  await expect(column(page, "June 2024")).toHaveAttribute("aria-pressed", "true");
  await expect(section(page).locator("svg text", { hasText: /^R\s4\s250,75$/ })).toBeVisible();
  await expect(section(page).getByText("June 2024", { exact: true }).last()).toBeVisible();
});

test("selecting March shows March 2024 · R 3 750,60 · 45 transactions · avg R 83,35", async ({ page }) => {
  await page.route(TRENDS, (route) => route.fulfill({ json: SPEC }));
  await page.goto("/");
  await column(page, "March 2024").click();
  await expect(column(page, "March 2024")).toHaveAttribute("aria-pressed", "true");
  await expect(section(page).locator("svg text", { hasText: "March 2024" })).toBeVisible();
  await expect(section(page).locator("svg text", { hasText: /^R\s3\s750,60$/ })).toBeVisible();
  await expect(section(page).locator("p", { hasText: "45 transactions · avg" })).toHaveText(
    /^March 2024\s*45 transactions · avg R\s83,35$/,
  );
});

test("with focus in the chart, the arrow keys move the selection and its name is read out", async ({ page }) => {
  await page.route(TRENDS, (route) => route.fulfill({ json: SPEC }));
  await page.goto("/");
  await column(page, "June 2024").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(column(page, "May 2024")).toBeFocused();
  await expect(column(page, "May 2024")).toHaveAttribute("aria-pressed", "true");
  await expect(column(page, "May 2024")).toHaveAccessibleName(
    /^May 2024: R\s3\s980,30, 44 transactions, average R\s90,46$/,
  );
  await page.keyboard.press("Home");
  await expect(column(page, "January 2024")).toBeFocused();
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`unselected columns contrast at least 3 to 1 with the card in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.route(TRENDS, (route) => route.fulfill({ json: SPEC }));
    await page.goto("/");
    await expect(chart(page).getByRole("button")).toHaveCount(6);
    const ratio = await section(page).evaluate((card) => {
      const rect = card.querySelector("svg rect.fill-bar");
      if (!rect) return 0;
      const channels = (colour: string) => (colour.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const luminance = (colour: string) => {
        const [r = 0, g = 0, b = 0] = channels(colour).map((value) => {
          const c = value / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const bar = luminance(getComputedStyle(rect).fill);
      const background = luminance(getComputedStyle(card).backgroundColor);
      return (Math.max(bar, background) + 0.05) / (Math.min(bar, background) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
}

test("with only 1 month there is one column and no gaps", async ({ page }) => {
  await page.route(TRENDS, (route) => route.fulfill({ json: { trends: [SPEC.trends[5]] } }));
  await page.goto("/");
  await expect(chart(page).getByRole("button")).toHaveCount(1);
  await expect(section(page).locator("svg rect.fill-bar-selected")).toHaveCount(1);
  await expect(section(page).locator("svg rect.fill-bar")).toHaveCount(0);
});

test("the guide line values are hidden on phones", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.route(TRENDS, (route) => route.fulfill({ json: SPEC }));
  await page.goto("/");
  await expect(chart(page).getByRole("button")).toHaveCount(6);
  await expect(section(page).getByText(/^R\s5\s000$/)).toBeHidden();
});

test("with no spending it shows the empty message", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-mock-scenario": "empty" });
  await page.goto("/");
  await expect(section(page).getByText("No monthly spending to show")).toBeVisible();
});

test("if the trends fail, only this card shows an error, and Retry brings them back", async ({ page }) => {
  await page.route(TRENDS, (route) => route.fulfill({ status: 500, json: {} }));
  await page.goto("/");
  await expect(section(page)).toContainText("Couldn't load trends");
  await page.unroute(TRENDS);
  await section(page).getByRole("button", { name: "Retry" }).click();
  await expect(chart(page)).toBeVisible();
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the chart passes the accessibility scan in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await expect(chart(page)).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
