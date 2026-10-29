import AxeBuilder from "@axe-core/playwright";
import { type Page, type TestInfo, expect } from "@playwright/test";

export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

export async function expectNoAxeIssues(page: Page, testInfo: TestInfo, label = testInfo.title): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  await testInfo.attach(`axe ${label}`, {
    body: JSON.stringify({ url: results.url, violations: results.violations, passes: results.passes.length }, null, 2),
    contentType: "application/json",
  });
  expect(results.violations.map(({ id, help, nodes }) => `${id}: ${help} (${nodes.length})`)).toEqual([]);
}
