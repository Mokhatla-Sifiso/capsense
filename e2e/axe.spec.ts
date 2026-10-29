import { type Page, expect, test } from "@playwright/test";
import { expectNoAxeIssues } from "./axe";

const SCENARIOS = ["error", "empty", "edge"] as const;

async function settled(page: Page) {
  await page.waitForFunction(() => document.querySelectorAll('section[aria-busy="true"]').length === 0);
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test("the loaded page has no accessibility issues", async ({ page }, testInfo) => {
      await page.goto("/");
      await settled(page);
      await expectNoAxeIssues(page, testInfo, `loaded ${colorScheme}`);
    });

    for (const scenario of SCENARIOS) {
      test(`the ${scenario} scenario has no accessibility issues`, async ({ page }, testInfo) => {
        await page.setExtraHTTPHeaders({ "x-mock-scenario": scenario });
        await page.goto("/");
        await settled(page);
        await expectNoAxeIssues(page, testInfo, `${scenario} ${colorScheme}`);
      });
    }

    test("the loading and still-loading states have no accessibility issues", async ({ page }, testInfo) => {
      test.setTimeout(30_000);
      await page.setExtraHTTPHeaders({ "x-mock-scenario": "slow" });
      await page.goto("/");
      await expect(page.locator('section[aria-busy="true"]').first()).toBeAttached();
      await expectNoAxeIssues(page, testInfo, `loading ${colorScheme}`);
      await expect(page.getByText("Still loading…").first()).toBeVisible({ timeout: 8_000 });
      await expectNoAxeIssues(page, testInfo, `still loading ${colorScheme}`);
    });
  });
}
