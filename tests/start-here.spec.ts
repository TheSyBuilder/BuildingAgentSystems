import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const storageKey = "building-agent-systems:start-here-diagnostic:v1";

async function tabTo(page: Page, target: Locator, limit = 48) {
  for (let index = 0; index < limit; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }
    await page.keyboard.press("Tab");
  }

  throw new Error(`Keyboard focus did not reach ${await target.getAttribute("id")}`);
}

test("Start Here renders the complete classification path", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/guide/start-here/");

  await expect(page).toHaveTitle("Start here · Building Agent Systems");
  await expect(
    page.getByRole("heading", { name: "Start with control, not the label." }),
  ).toBeVisible();
  await expect(page.locator(".taxonomy-card")).toHaveCount(5);
  await expect(page.locator(".decision-list > li")).toHaveCount(4);
  await expect(
    page.getByRole("heading", { name: "Classify one real task." }),
  ).toBeVisible();

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

test("Start Here diagnostic classifies and restores a task with the keyboard", async ({
  page,
}) => {
  await page.goto("/guide/start-here/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const diagnostic = page.locator("#diagnostic");
  const uncertainty = diagnostic.getByLabel(
    "What cannot be encoded reliably in advance?",
  );
  await tabTo(page, uncertainty);
  await page.keyboard.type(
    "Deciding whether two issue reports describe the same failure.",
    { delay: 8 },
  );
  await expect(uncertainty).toHaveValue(
    "Deciding whether two issue reports describe the same failure.",
  );

  const readOnly = diagnostic.getByRole("radio", { name: /read only/i });
  await tabTo(page, readOnly);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(
    diagnostic.getByRole("radio", { name: /change after approval/i }),
  ).toBeChecked();

  const start = diagnostic.getByRole("button", {
    name: /start the decision path/i,
  });
  await tabTo(page, start);
  await page.keyboard.press("Enter");

  for (const answer of ["no", "no", "no", "yes"] as const) {
    const heading = diagnostic.locator("h3[tabindex='-1']");
    await expect(heading).toBeFocused();
    await page.keyboard.press("Tab");
    if (answer === "no") await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
  }

  await expect(
    diagnostic.getByRole("heading", { name: "Agent candidate" }),
  ).toBeFocused();
  await expect(
    diagnostic.getByText(
      "Deciding whether two issue reports describe the same failure.",
    ),
  ).toBeVisible();
  await expect(diagnostic.getByText("Change after approval", { exact: true })).toBeVisible();
  await expect(diagnostic.getByText("Receipt saved on this device")).toBeVisible();

  const stored = await page.evaluate((key) => {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, storageKey);

  expect(stored).toMatchObject({
    version: 1,
    phase: "result",
    uncertainty: "Deciding whether two issue reports describe the same failure.",
    boundary: "approve",
    classification: "agent",
    answers: {
      response: "no",
      specified: "no",
      human: "no",
      bounded: "yes",
    },
  });

  await page.screenshot({
    path: "test-results/start-here-diagnostic-result.png",
    fullPage: true,
  });

  await page.reload();
  await expect(
    diagnostic.getByRole("heading", { name: "Agent candidate" }),
  ).toBeVisible();
  await expect(diagnostic.getByText(/saved on this device|restored from this device/i)).toBeVisible();
});

test("Start Here supports a keyboard-only path into the flagship lab", async ({
  page,
}) => {
  await page.goto("/guide/start-here/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const labLink = page.getByRole("link", { name: /open the agent loop/i });
  await tabTo(page, labLink);
  await expect(labLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/labs\/agent-loop\/$/);
  await expect(page.getByRole("heading", { name: "The loop is the system." })).toBeVisible();
});

test("Start Here preserves the complete path without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/guide/start-here/");

  await expect(page.locator(".decision-list > li")).toHaveCount(4);
  await expect(page.locator(".decision-section")).toContainText("Complete text path");
  await expect(page.getByText("You have an agent candidate.", { exact: true })).toBeVisible();

  await context.close();
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

  const diagnostic = page.locator("#diagnostic");
  await diagnostic
    .getByLabel("What cannot be encoded reliably in advance?")
    .fill("Judging whether a report is a duplicate.");
  await diagnostic.getByRole("radio", { name: /propose/i }).check();
  await diagnostic.getByRole("button", { name: /start the decision path/i }).click();
  await diagnostic.getByRole("button", { name: "No" }).click();
  await diagnostic.getByRole("button", { name: "No" }).click();
  await diagnostic.getByRole("button", { name: "No" }).click();
  await diagnostic.getByRole("button", { name: "Yes" }).click();

  const resultSevere = await new AxeBuilder({ page })
    .include("#diagnostic")
    .disableRules(["color-contrast"])
    .analyze();
  expect(
    resultSevere.violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    ),
  ).toEqual([]);

  const resultContrast = await new AxeBuilder({ page })
    .include("#diagnostic")
    .withRules(["color-contrast"])
    .analyze();
  expect(resultContrast.violations).toEqual([]);
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
    const diagnostic = getComputedStyle(document.querySelector(".diagnostic-section")!);
    const diagnosticControl = getComputedStyle(
      document.querySelector(".diagnostic-primary")!,
    );

    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      shellBorders: [shell.borderLeftWidth, shell.borderRightWidth],
      signal: signal.backgroundColor,
      taxonomy: taxonomy.backgroundColor,
      decision: decision.backgroundColor,
      agent: agent.backgroundColor,
      diagnostic: diagnostic.backgroundColor,
      diagnosticTransition: Number.parseFloat(diagnosticControl.transitionDuration),
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
    diagnostic: "rgb(198, 255, 57)",
    diagnosticTransition: 0.00001,
    statusAnimation: "none",
    scrollBehavior: "auto",
  });

  await page.screenshot({
    path: "test-results/start-here-mobile-reduced.png",
    fullPage: true,
  });
});
