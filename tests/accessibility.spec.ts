import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("front door has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  const severe = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical"
  );

  expect(severe).toEqual([]);
});

test("front door passes axe color contrast", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("agent loop has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/labs/agent-loop/");

  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  const severe = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical"
  );

  expect(severe).toEqual([]);
});

test("agent loop passes axe color contrast", async ({ page }) => {
  await page.goto("/labs/agent-loop/");

  const results = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .analyze();

  expect(results.violations).toEqual([]);
});
