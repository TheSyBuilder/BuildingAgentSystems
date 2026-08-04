import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Agent Foundations renders the complete textual architecture canvas", async ({ page }) => {
  await page.goto("/guide/agent-foundations/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Architecture before autonomy." }),
  ).toBeVisible();

  for (const heading of [
    "Goal",
    "Instructions",
    "Context",
    "Model",
    "State",
    "Stop conditions",
    "Run state",
    "Session",
    "Memory",
    "Durable work",
  ]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }

  const canvas = page.locator("#architecture-canvas");
  for (const field of [
    "Goal",
    "Success evidence",
    "Instructions",
    "Context",
    "Model choice",
    "Deterministic shell",
    "Authority",
    "Run state",
    "Persistence",
    "Stop conditions",
    "Handoff receipt",
  ]) {
    await expect(canvas.getByText(field, { exact: true })).toBeVisible();
  }

  await expect(page.locator('script[src]')).toHaveCount(0);
  await expect(page.getByText("Verified: 2026-08-04", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "test-results/agent-foundations-desktop.png",
    fullPage: true,
  });
});

test("Agent Foundations supports its complete keyboard path", async ({ page }) => {
  await page.goto("/guide/agent-foundations/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const canvasLink = page.getByRole("link", { name: "Canvas", exact: true });
  await canvasLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#architecture-canvas$/);
  await expect(page.getByRole("heading", { name: "Make every owner visible." })).toBeVisible();

  const loopLink = page.getByRole("link", { name: /Open the agent loop/ });
  await loopLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/labs\/agent-loop\/$/);
  await expect(page.getByRole("heading", { level: 1, name: /The loop is the system/i })).toBeVisible();
});

test("Agent Foundations has no serious, critical, or contrast violations", async ({ page }) => {
  await page.goto("/guide/agent-foundations/");

  const structural = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  const severe = structural.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical"
  );
  expect(severe).toEqual([]);

  const contrast = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .analyze();
  expect(contrast.violations).toEqual([]);
});

test("Agent Foundations keeps its visual contract on mobile and reduced motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/guide/agent-foundations/");

  const motion = await page.locator(".module-status-dot").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      animationName: style.animationName,
      transitionDuration: style.transitionDuration,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });

  expect(motion.animationName).toBe("none");
  expect(Number.parseFloat(motion.transitionDuration)).toBeLessThanOrEqual(0.00001);
  expect(motion.scrollBehavior).toBe("auto");

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(overflow.page).toBeLessThanOrEqual(overflow.viewport);

  await expect(page.getByRole("heading", { name: "Make every owner visible." })).toBeVisible();
  await page.screenshot({
    path: "test-results/agent-foundations-mobile-reduced-motion.png",
    fullPage: true,
  });

  await context.close();
});
