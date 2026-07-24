import { expect, test } from "@playwright/test";

test("front door renders and works from the keyboard", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /build the loop/i }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Work in progress");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.getByRole("link", { name: "See what ships first" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#first-lab$/);
  await expect(
    page.getByRole("heading", { name: "The agent loop, made inspectable." }),
  ).toBeVisible();
});

test("reduced motion removes the status loop", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/reduced-motion.png",
    fullPage: true,
  });

  const motion = await page.locator(".status-dot").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      duration: style.animationDuration,
      iterations: style.animationIterationCount,
    };
  });

  expect(Number.parseFloat(motion.duration)).toBeLessThanOrEqual(0.00001);
  expect(motion.iterations).toBe("1");
});

test("small-screen layout keeps the primary path available", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "First lab" })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 360);
});
