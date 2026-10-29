import { type Page, expect, test } from "@playwright/test";
import { expectNoAxeIssues } from "./axe";

const GOALS = "**/api/customers/*/goals";
const ENTERTAINMENT = {
  id: "goal_001",
  category: "Entertainment",
  monthlyBudget: 1000,
  currentSpent: 650.3,
  percentageUsed: 65.03,
  daysRemaining: 12,
  status: "on_track",
};
const GROCERIES = {
  id: "goal_002",
  category: "Groceries",
  monthlyBudget: 1500,
  currentSpent: 1450.8,
  percentageUsed: 96.72,
  daysRemaining: 12,
  status: "warning",
};

const section = (page: Page) => page.getByRole("region", { name: "Spending goals" });
const goal = (page: Page, name: string) =>
  section(page)
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name }) });
const answer = (page: Page, goals: object[]) => page.route(GOALS, (route) => route.fulfill({ json: { goals } }));

test("goal 1 shows a 65% ring, On track, R 650,30 of R 1 000,00 and its projection", async ({ page }) => {
  await answer(page, [ENTERTAINMENT, GROCERIES]);
  await page.goto("/");
  const first = goal(page, "Entertainment");
  await expect(first.getByRole("progressbar", { name: "Entertainment" })).toHaveAttribute(
    "aria-valuetext",
    /^65,0%\sused$/,
  );
  await expect(first).toContainText("65%");
  await expect(first).toContainText("On track");
  await expect(first).toContainText(/R\s650,30 of R\s1\s000,00/);
  await expect(first).toContainText(/Projected R\s1\s083,83 of R\s1\s000,00/);
  await expect(first).toContainText(/On pace to exceed by R\s83,83/);
  await expect(section(page)).toContainText("This month · 12 days left");
});

test("a warning goal shows Close to limit and an amber ring", async ({ page }) => {
  await answer(page, [ENTERTAINMENT, GROCERIES]);
  await page.goto("/");
  const second = goal(page, "Groceries");
  await expect(second).toContainText("Close to limit");
  await expect(second.locator("circle.stroke-warning-ring")).toHaveCount(1);
});

test("R 1 600 spent of R 1 500 shows Over budget by R 100,00", async ({ page }) => {
  await answer(page, [{ ...ENTERTAINMENT, monthlyBudget: 1500, currentSpent: 1600, percentageUsed: 106.67 }]);
  await page.goto("/");
  await expect(goal(page, "Entertainment")).toContainText(/Over budget by R\s100,00/);
  await expect(goal(page, "Entertainment").getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
});

test("on day 0 it is too early to project", async ({ page }) => {
  await answer(page, [{ ...ENTERTAINMENT, currentSpent: 0, percentageUsed: 0, daysRemaining: 30 }]);
  await page.goto("/");
  await expect(goal(page, "Entertainment")).toContainText("Too early to project");
});

test("each seed projection is spent so far ÷ 16 days × 30", async ({ page }) => {
  const response = page.waitForResponse((reply) => reply.url().includes("/goals"));
  await page.goto("/");
  const { goals } = (await (await response).json()) as { goals: (typeof ENTERTAINMENT)[] };
  expect(goals.length).toBeGreaterThan(0);
  for (const seeded of goals) {
    expect(seeded.daysRemaining).toBe(14);
    const projected = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" })
      .format(Math.round((seeded.currentSpent / 16) * 30 * 100) / 100)
      .replace(/\s/g, "\\s");
    await expect(goal(page, seeded.category)).toContainText(new RegExp(`Projected ${projected} of`));
  }
});

test("with no goals it shows the empty message", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-mock-scenario": "empty" });
  await page.goto("/");
  await expect(section(page).getByText("No spending goals yet")).toBeVisible();
  await expect(section(page).getByText(/^This month/)).toHaveCount(0);
});

test("if the goals fail, only this card shows an error, and Retry brings them back", async ({ page }) => {
  await page.route(GOALS, (route) => route.fulfill({ status: 500, json: {} }));
  await page.goto("/");
  await expect(section(page)).toContainText("Couldn't load goals");
  await page.unroute(GOALS);
  await section(page).getByRole("button", { name: "Retry" }).click();
  await expect(section(page).getByRole("article")).not.toHaveCount(0);
});

test("on a tablet the two goals sit side by side, and on a laptop they are stacked", async ({ page }) => {
  await answer(page, [ENTERTAINMENT, GROCERIES]);
  for (const [width, sideBySide] of [
    [768, true],
    [1280, false],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const [first, second] = await Promise.all(
      ["Entertainment", "Groceries"].map(async (name) => goal(page, name).boundingBox()),
    );
    if (!first || !second) throw new Error("a goal is missing");
    expect(second.x > first.x).toBe(sideBySide);
    expect(second.y > first.y + first.height - 1).toBe(!sideBySide);
  }
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the goals pass the accessibility scan in ${colorScheme} mode`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await answer(page, [
      ENTERTAINMENT,
      GROCERIES,
      { ...GROCERIES, id: "goal_003", category: "Dining", monthlyBudget: 0 },
    ]);
    await page.goto("/");
    await expect(section(page).getByRole("article")).toHaveCount(3);
    await expectNoAxeIssues(page, testInfo);
  });
}
