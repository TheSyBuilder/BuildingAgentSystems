import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const canvasStorageKey = "building-agent-systems:architecture-canvas:v1";
const canvasValues = {
  workingTitle: "Read-only issue triage",
  goal: "Propose one label and priority a maintainer can review.",
  successEvidence: "A valid label, stated priority, cited facts, and rationale.",
  instructions: "Separate fact from inference and never invent a duplicate.",
  context: "Current issue, label taxonomy, rubric, and retrieved similar issues.",
  modelChoice: "Choose the next useful read and draft a supported proposal.",
  deterministicShell: "Validate inputs, execute allowlisted reads, and count steps.",
  authority: "approve",
  runState: "Issue ID, evidence, tool results, step count, and pending handoff.",
  persistence: "Retain only the exportable proposal receipt.",
  stopConditions: "Verified proposal, denied result, budget reached, or approval required.",
  handoffReceipt: "Outcome, evidence, remaining uncertainty, and approval request.",
} as const;

const storedCanvas = {
  version: 1,
  step: 3,
  values: canvasValues,
};

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

  const canvas = page.locator("#architecture-canvas .canvas-sheet");
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

  await expect(page.getByText("Verified: 2026-08-04", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "test-results/agent-foundations-desktop.png",
    fullPage: true,
  });
});

test("Architecture canvas builds and restores a blueprint draft with the keyboard", async ({
  page,
}) => {
  await page.goto("/guide/agent-foundations/");
  await page.evaluate((key) => window.localStorage.removeItem(key), canvasStorageKey);
  await page.reload();

  const enterText = async (selector: string, value: string) => {
    await page.locator(selector).focus();
    await page.keyboard.insertText(value);
  };

  await enterText("#canvas-working-title", canvasValues.workingTitle);
  await enterText("#canvas-goal", canvasValues.goal);
  await enterText("#canvas-success-evidence", canvasValues.successEvidence);

  const continueToControl = page.getByRole("button", { name: /Continue to control/ });
  await continueToControl.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Assign control." })).toBeFocused();

  await enterText("#canvas-instructions", canvasValues.instructions);
  await enterText("#canvas-context", canvasValues.context);
  await enterText("#canvas-model-choice", canvasValues.modelChoice);
  await enterText("#canvas-deterministic-shell", canvasValues.deterministicShell);
  const authority = page.getByRole("radio", { name: /Change after approval/ });
  await authority.focus();
  await page.keyboard.press("Space");
  await expect(authority).toBeChecked();

  const continueToContinuity = page.getByRole("button", { name: /Continue to continuity/ });
  await continueToContinuity.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Design continuity." })).toBeFocused();

  await enterText("#canvas-run-state", canvasValues.runState);
  await enterText("#canvas-persistence", canvasValues.persistence);
  await enterText("#canvas-stop-conditions", canvasValues.stopConditions);
  await enterText("#canvas-handoff-receipt", canvasValues.handoffReceipt);

  const buildDraft = page.getByRole("button", { name: /Build blueprint draft/ });
  await buildDraft.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Blueprint draft ready." })).toBeFocused();
  await expect(page.getByText("Blueprint draft saved on this device", { exact: true })).toBeVisible();
  await expect(page.getByText(canvasValues.goal, { exact: true })).toBeVisible();
  await expect(page.getByText("Change after approval", { exact: true })).toBeVisible();

  const stored = await page.evaluate((key) => {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, canvasStorageKey);
  expect(stored).toEqual(storedCanvas);

  await page.screenshot({
    path: "test-results/agent-foundations-blueprint-draft.png",
    fullPage: true,
  });

  await page.reload();
  await expect(page.getByRole("heading", { name: "Blueprint draft ready." })).toBeVisible();
  await expect(page.getByText("Blueprint draft restored from this device", { exact: true })).toBeVisible();

  const editOutcome = page.getByRole("button", { name: /Edit outcome/ });
  await editOutcome.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Name the outcome." })).toBeFocused();
  await expect(page.locator("#canvas-working-title")).toHaveValue(canvasValues.workingTitle);
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

test("Agent Foundations preserves its complete textual canvas without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/guide/agent-foundations/");

  await expect(page.getByText(/The drafting controls need JavaScript/)).toBeVisible();
  const reference = page.locator("#architecture-canvas .canvas-sheet");
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
    await expect(reference.getByText(field, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("Reader copy · blank canvas", { exact: true })).toBeVisible();

  await context.close();
});

test("Agent Foundations has no serious, critical, or contrast violations", async ({ page }) => {
  await page.goto("/guide/agent-foundations/");

  const assertAxe = async () => {
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
  };

  await assertAxe();
  await page.evaluate(
    ({ key, draft }) => window.localStorage.setItem(key, JSON.stringify(draft)),
    { key: canvasStorageKey, draft: storedCanvas },
  );
  await page.reload();
  await expect(page.getByText("Blueprint draft restored from this device", { exact: true })).toBeVisible();
  await assertAxe();
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
  await expect(page.getByRole("heading", { name: "Draft your architecture." })).toBeVisible();
  await page.screenshot({
    path: "test-results/agent-foundations-mobile-reduced-motion.png",
    fullPage: true,
  });

  await context.close();
});
