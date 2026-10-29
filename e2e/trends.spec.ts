import { type Page, expect, test } from "@playwright/test";
import { expectNoAxeIssues } from "./axe";

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
  await expect(section(page).locator("p > span", { hasText: /^June 2024$/ })).toBeVisible();
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
  test(`the chart passes the accessibility scan in ${colorScheme} mode`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await expect(chart(page)).toBeVisible();
    await expectNoAxeIssues(page, testInfo);
  });
}

const monthsSelect = (page: Page) => section(page).getByRole("combobox", { name: "Months" });
const asked = (page: Page) => {
  const months: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/spending/trends?"))
      months.push(new URL(request.url()).searchParams.get("months") ?? "");
  });
  return months;
};

test("with nothing chosen 12 months are asked for, and choosing 24 asks again without adding a Back step", async ({
  page,
}) => {
  const months = asked(page);
  await page.goto("/");
  await expect(chart(page)).toBeVisible();
  await expect(monthsSelect(page)).toHaveValue("12");
  const entries = await page.evaluate(() => history.length);
  await monthsSelect(page).selectOption("24");
  await expect(page).toHaveURL(/[?&]months=24\b/);
  await expect(section(page)).toContainText("Showing the 21 months available of the 24 requested.");
  expect(months).toEqual(["12", "24"]);
  expect(await page.evaluate(() => history.length)).toBe(entries);
});

test("a chosen 6 months is still chosen after a reload, with 6 columns", async ({ page }) => {
  await page.goto("/");
  await monthsSelect(page).selectOption("6");
  await expect(chart(page).getByRole("button")).toHaveCount(6);
  await page.reload();
  await expect(monthsSelect(page)).toHaveValue("6");
  await expect(chart(page).getByRole("button")).toHaveCount(6);
  await expect(section(page)).not.toContainText("months available");
});

test("6 months returned for 12 asked for shows the note", async ({ page }) => {
  await page.route(TRENDS, (route) => route.fulfill({ json: SPEC }));
  await page.goto("/");
  await expect(section(page).getByText("Showing the 6 months available of the 12 requested.")).toBeVisible();
});

test("Show data table shows every month with what was spent, the count and the average", async ({ page }) => {
  await page.route(TRENDS, (route) => route.fulfill({ json: SPEC }));
  await page.goto("/");
  const table = section(page).getByRole("table", { name: "Monthly spending" });
  await expect(table).toBeHidden();
  await section(page).getByRole("button", { name: "Show data table" }).click();
  await expect(table.getByRole("row")).toHaveCount(7);
  await expect(table.getByRole("row").nth(3)).toHaveText(/^March 2024\s*R\s3\s750,60\s*45\s*R\s83,35$/);
  await expect(section(page).getByRole("button", { name: "Hide data table" })).toHaveAttribute("aria-expanded", "true");
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the open data table passes the accessibility scan in ${colorScheme} mode`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/?months=24");
    await section(page).getByRole("button", { name: "Show data table" }).click();
    await expect(section(page).getByRole("table")).toBeVisible();
    await expectNoAxeIssues(page, testInfo);
  });
}

test("on phones the months select and data table button are at least 44 px tall", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(chart(page)).toBeVisible();
  for (const control of [monthsSelect(page), section(page).getByRole("button", { name: "Show data table" })]) {
    expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
});

async function labelsFit(page: Page) {
  return chart(page).evaluate((group) => {
    const row = group.parentElement?.nextElementSibling;
    if (!row) return "no label row";
    const edges = row.getBoundingClientRect();
    const labels = [...row.querySelectorAll<HTMLElement>(":scope > span > span")]
      .filter((label) => getComputedStyle(label).visibility !== "hidden")
      .map((label) => ({ text: label.textContent, box: label.getBoundingClientRect() }));
    const outside = labels.filter(({ box }) => box.left < edges.left - 0.5 || box.right > edges.right + 0.5);
    const touching = labels.flatMap((a, index) =>
      labels
        .slice(index + 1)
        .filter((b) => a.box.right + 2 > b.box.left && b.box.right + 2 > a.box.left)
        .map((b) => `${a.text}|${b.text}`),
    );
    return [...outside.map(({ text }) => `${text} outside`), ...touching].join(", ") || "fits";
  });
}

test("on a laptop the selected month's label stays inside the chart and clear of its neighbours", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route(TRENDS, (route) => route.fulfill({ json: SPEC }));
  await page.goto("/");
  await column(page, "January 2024").click();
  expect(await labelsFit(page)).toBe("fits");
  await page.unroute(TRENDS);
  await page.goto("/?months=24");
  await expect(chart(page).getByRole("button")).toHaveCount(21);
  expect(await labelsFit(page)).toBe("fits");
  await column(page, "March 2023").click();
  expect(await labelsFit(page)).toBe("fits");
});
