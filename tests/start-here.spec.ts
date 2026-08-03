import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Start Here renders the complete classification path", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/guide/start-here/");

  await expect(page).toHaveTitle("Start here · Building Agent Systems");
  await expect(
    page.getByRole("heading", { name: "Start with control, not the label." }),
  ).toBeVisible();
  await expect(page.locator(".taxonomy-card")).toHaveCount(5);
  await expect(page.locator(".decision-list > li")).toHaveCount(4);

  for (const outcome of [
    "Use a chatbot.",
    "Use automation for one action; a deterministic workflow for several.",
    "Use a copilot.",
    "You have an agent candidate.",
    "Keep it human-led or shrink the job until those controls exist.",
  ]) {
    await expect(page.getByText(outcome, { exact: true })).toBeVisible();
  }

  await expect(page.getByText("Classification receipt · BAS-001")).toBeVisible();
  await expect(page.getByText("Verified: 2026-08-03")).toBeVisible();

  await page.screenshot({
    path: "test-results/start-here-desktop.png",
    fullPage: true,
  });
});

test("Start Here supports a keyboard-only path into the flagship lab", async ({
  page,
}) => {
  await page.goto("/guide/start-here/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press("Tab");
  }

  await expect(page.getByRole("link", { name: /open the agent loop/i })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/labs\/agent-loop\/$/);
  await expect(page.getByRole("heading", { name: "The loop is the system." })).toBeVisible();
});

test("Start Here has no serious, critical, or color-contrast violations", async ({
  page,
}) => {
  await page.goto("/guide/start-here/");

  const severeResults = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  const severe = severeResults.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );
  expect(severe).toEqual([]);

  const contrastResults = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .analyze();
  expect(contrastResults.violations).toEqual([]);
});

test("Start Here keeps its visual contract on mobile and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/guide/start-here/");

  const contract = await page.evaluate(() => {
    const shell = getComputedStyle(document.querySelector(".module-shell")!);
    const signal = getComputedStyle(document.querySelector(".hero-signal")!);
    const taxonomy = getComputedStyle(document.querySelector(".taxonomy-section")!);
    const decision = getComputedStyle(document.querySelector(".decision-section")!);
    const agent = getComputedStyle(document.querySelector(".taxonomy-card-agent")!);
    const status = getComputedStyle(document.querySelector(".module-status-dot")!);

    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      shellBorders: [shell.borderLeftWidth, shell.borderRightWidth],
      signal: signal.backgroundColor,
      taxonomy: taxonomy.backgroundColor,
      decision: decision.backgroundColor,
      agent: agent.backgroundColor,
      statusAnimation: status.animationName,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });

  expect(contract).toEqual({
    overflow: 0,
    shellBorders: ["2px", "2px"],
    signal: "rgb(79, 115, 255)",
    taxonomy: "rgb(21, 21, 21)",
    decision: "rgb(255, 93, 58)",
    agent: "rgb(198, 255, 57)",
    statusAnimation: "none",
    scrollBehavior: "auto",
  });

  await page.screenshot({
    path: "test-results/start-here-mobile-reduced.png",
    fullPage: true,
  });
});
