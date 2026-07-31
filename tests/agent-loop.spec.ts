import { expect, test } from "@playwright/test";

test("agent loop completes with keyboard-only controls", async ({ page }) => {
  await page.goto("/labs/agent-loop/");

  await expect(
    page.getByRole("heading", { level: 1, name: "The loop is the system." }),
  ).toBeVisible();

  const observeTab = page.getByRole("tab", { name: /observe/i });
  const decideTab = page.getByRole("tab", { name: /decide/i });
  await observeTab.focus();
  await expect(observeTab).toHaveAttribute("aria-selected", "true");

  await expect(async () => {
    await observeTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(decideTab).toBeFocused({ timeout: 500 });
  }).toPass({ timeout: 5_000 });

  await expect(decideTab).toBeFocused();
  await expect(decideTab).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("heading", { name: "Search before classifying." }),
  ).toBeVisible();

  await page.keyboard.press("End");
  const stopTab = page.getByRole("tab", { name: /stop/i });
  await expect(stopTab).toBeFocused();
  await expect(stopTab).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("heading", { name: "Propose; do not apply." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /loop stopped/i })).toBeDisabled();

  await page.keyboard.press("Home");
  await expect(observeTab).toBeFocused();

  const nextButton = page.getByRole("button", { name: /next stage/i });
  await nextButton.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Search before classifying." }),
  ).toBeVisible();
});

test("agent loop has a complete textual equivalent", async ({ page }) => {
  await page.goto("/labs/agent-loop/");

  await page.getByText("Read the complete trace").click();
  const transcript = page.locator(".trace-transcript");
  await expect(transcript.getByRole("listitem")).toHaveCount(6);
  await expect(transcript).toContainText("approval gate");
});

test("agent loop honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/labs/agent-loop/");

  const statusMotion = await page.locator(".lab-status-dot").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      name: style.animationName,
      duration: style.animationDuration,
    };
  });

  expect(statusMotion.name).toBe("none");

  await page.getByRole("tab", { name: /decide/i }).click();
  const panelMotion = await page.locator(".trace-panel").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      transform: style.transform,
      transitionDuration: style.transitionDuration,
    };
  });

  expect(panelMotion.transform).toBe("none");
  expect(Number.parseFloat(panelMotion.transitionDuration)).toBeLessThanOrEqual(
    0.00001,
  );

  await page.screenshot({
    path: "test-results/agent-loop-reduced-motion.png",
    fullPage: true,
  });
});

test("agent loop remains usable on a small screen", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/labs/agent-loop/");

  await expect(page.getByRole("tab", { name: /observe/i })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 360);
  await page.screenshot({
    path: "test-results/agent-loop-mobile.png",
    fullPage: true,
  });
});
