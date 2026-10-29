import { expect, test } from "@playwright/test";
import { expectNoAxeIssues } from "./axe";

test("landing page renders with one h1 and no WCAG 2.2 AA violations", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Spending insights");
  await expectNoAxeIssues(page, testInfo);
});

test("baseline security headers are sent (NFR-S1)", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});
