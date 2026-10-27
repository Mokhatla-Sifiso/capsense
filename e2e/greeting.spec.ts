import { expect, test } from "@playwright/test";

const ELEVEN_FIFTY_NINE_SAST = "2024-09-16T09:59:30Z";
const AFTER_NOON_SAST = new Date("2024-09-16T10:05:00Z");

test.describe("greeting", () => {
  test.use({ timezoneId: "America/New_York", extraHTTPHeaders: { "x-mock-now": ELEVEN_FIFTY_NINE_SAST } });

  test("keeps the server's time of day after loading, with no warnings, whatever the browser clock says", async ({
    page,
  }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
    });
    await page.clock.setFixedTime(AFTER_NOON_SAST);
    await page.goto("/");

    await expect(page.getByText("Good morning, John")).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("keyboard focus shows the profile tooltip and Escape hides it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const greeting = page.getByText("Good morning, John");
    await greeting.focus();
    await expect(page.getByRole("tooltip")).toHaveText("John Doe · Premium · Customer since 15 Jan 2023");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toBeHidden();
    await expect(greeting).toBeFocused();
  });

  test("when the profile fails, Retry asks for the profile only and then greets by name", async ({ page }) => {
    let profileCalls = 0;
    await page.route("**/api/customers/*/profile", async (route) => {
      profileCalls += 1;
      if (profileCalls === 1) await route.fulfill({ status: 500, json: { error: "server_error" } });
      else await route.continue();
    });
    const otherCalls: string[] = [];
    await page.goto("/");
    await expect(page.getByText("Couldn't load profile")).toBeVisible();
    await expect(page.getByText("Good morning", { exact: true })).toBeVisible();

    page.on("request", (request) => {
      if (request.url().includes("/api/") && !request.url().includes("/profile")) otherCalls.push(request.url());
    });
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.getByText("Good morning, John")).toBeVisible();
    expect(profileCalls).toBe(2);
    expect(otherCalls).toEqual([]);
  });

  test("the customer ID, email and lifetime spend are nowhere on the page, in the address or in storage", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("Good morning, John")).toBeVisible();
    const everything = await page.evaluate(() =>
      [
        document.documentElement.outerHTML,
        location.href,
        document.cookie,
        JSON.stringify(localStorage),
        JSON.stringify(sessionStorage),
      ].join("\n"),
    );
    for (const secret of ["12345", "john.doe@email.com", "15420"]) {
      expect(everything.includes(secret), secret).toBe(false);
    }
  });
});
