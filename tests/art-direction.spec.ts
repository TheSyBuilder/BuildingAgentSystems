import { expect, test, type Page } from "@playwright/test";

const colors = {
  paper: "rgb(243, 240, 232)",
  ink: "rgb(21, 21, 21)",
  acid: "rgb(198, 255, 57)",
  coral: "rgb(255, 93, 58)",
  blue: "rgb(79, 115, 255)",
  labBlue: "rgb(51, 79, 194)",
};

async function readRootTokens(page: Page) {
  return page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      paper: style.getPropertyValue("--paper").trim(),
      ink: style.getPropertyValue("--ink").trim(),
      acid: style.getPropertyValue("--acid").trim(),
      coral: style.getPropertyValue("--coral").trim(),
      blue: style.getPropertyValue("--blue").trim(),
      rule: style.getPropertyValue("--rule").trim(),
      pagePad: style.getPropertyValue("--page-pad").trim(),
      sans: style.getPropertyValue("--font-sans").trim(),
      mono: style.getPropertyValue("--font-mono").trim(),
    };
  });
}

test("front door conforms to the locked art direction", async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.goto("/");

  await expect.poll(() => readRootTokens(page)).toEqual({
    paper: "#f3f0e8",
    ink: "#151515",
    acid: "#c6ff39",
    coral: "#ff5d3a",
    blue: "#4f73ff",
    rule: "2px solid #151515",
    pagePad: "clamp(1rem, 3vw, 2.5rem)",
    sans:
      '"Arial Narrow", "Avenir Next Condensed", "Helvetica Neue", sans-serif',
    mono: '"SFMono-Regular", "Roboto Mono", "Courier New", monospace',
  });

  const contract = await page.evaluate(() => {
    const style = (selector: string) =>
      getComputedStyle(document.querySelector(selector) as Element);
    const shell = style(".site-shell");
    const banner = style(".wip-banner");
    const headline = style(".hero h1");
    const eyebrow = style(".eyebrow");
    const accent = style(".accent-line");
    const action = style(".primary-link");
    const workbench = style(".loop-board");
    const path = style(".path-section");

    return {
      shell: {
        width: shell.width,
        borderLeft: shell.borderLeftWidth,
        borderRight: shell.borderRightWidth,
      },
      banner: {
        background: banner.backgroundColor,
        borderBottom: banner.borderBottomWidth,
        font: banner.fontFamily,
        transform: banner.textTransform,
      },
      headline: {
        font: headline.fontFamily,
        weight: headline.fontWeight,
        transform: headline.textTransform,
      },
      eyebrow: {
        font: eyebrow.fontFamily,
        transform: eyebrow.textTransform,
      },
      accent: accent.backgroundColor,
      action: {
        background: action.backgroundColor,
        border: action.borderTopWidth,
        shadow: action.boxShadow,
        font: action.fontFamily,
        transform: action.textTransform,
      },
      workbench: workbench.backgroundColor,
      path: path.backgroundColor,
    };
  });

  expect(contract.shell).toEqual({
    width: "1600px",
    borderLeft: "2px",
    borderRight: "2px",
  });
  expect(contract.banner.background).toBe(colors.acid);
  expect(contract.banner.borderBottom).toBe("2px");
  expect(contract.banner.font).toContain("SFMono-Regular");
  expect(contract.banner.transform).toBe("uppercase");
  expect(contract.headline.font).toContain("Arial Narrow");
  expect(contract.headline.weight).toBe("900");
  expect(contract.headline.transform).toBe("uppercase");
  expect(contract.eyebrow.font).toContain("SFMono-Regular");
  expect(contract.eyebrow.transform).toBe("uppercase");
  expect(contract.accent).toBe(colors.blue);
  expect(contract.action.background).toBe(colors.acid);
  expect(contract.action.border).toBe("2px");
  expect(contract.action.shadow).toContain("5px 5px");
  expect(contract.action.font).toContain("SFMono-Regular");
  expect(contract.action.transform).toBe("uppercase");
  expect(contract.workbench).toBe(colors.ink);
  expect(contract.path).toBe(colors.coral);

  await page.screenshot({
    path: "test-results/art-direction-home.png",
    fullPage: true,
  });
});

test("agent loop conforms to the locked art direction", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/labs/agent-loop/");

  const contract = await page.evaluate(() => {
    const style = (selector: string) =>
      getComputedStyle(document.querySelector(selector) as Element);
    const shell = style(".loop-lab-shell");
    const headline = style(".lab-intro h1");
    const kicker = style(".lab-kicker");
    const simulator = style(".simulator");
    const issue = style(".issue-brief");
    const selectedStage = style('[role="tab"][aria-selected="true"]');
    const panel = style(".trace-panel");
    const receipt = style(".verification-note");
    const chip = style(".read-only-chip");
    const takeaway = style(".lab-takeaway");

    return {
      shell: {
        blue: shell.getPropertyValue("--blue").trim(),
        borderLeft: shell.borderLeftWidth,
        borderRight: shell.borderRightWidth,
      },
      headline: {
        font: headline.fontFamily,
        weight: headline.fontWeight,
        transform: headline.textTransform,
      },
      kicker: {
        font: kicker.fontFamily,
        transform: kicker.textTransform,
      },
      simulator: simulator.backgroundColor,
      issue: issue.backgroundColor,
      selectedStage: {
        background: selectedStage.backgroundColor,
        shadow: selectedStage.boxShadow,
      },
      panel: {
        background: panel.backgroundColor,
        border: panel.borderTopWidth,
        shadow: panel.boxShadow,
      },
      receipt: receipt.backgroundColor,
      chip: chip.backgroundColor,
      takeaway: takeaway.backgroundColor,
    };
  });

  expect(contract.shell).toEqual({
    blue: "#334fc2",
    borderLeft: "2px",
    borderRight: "2px",
  });
  expect(contract.headline.font).toContain("Arial Narrow");
  expect(contract.headline.weight).toBe("900");
  expect(contract.headline.transform).toBe("uppercase");
  expect(contract.kicker.font).toContain("SFMono-Regular");
  expect(contract.kicker.transform).toBe("uppercase");
  expect(contract.simulator).toBe(colors.ink);
  expect(contract.issue).toBe(colors.coral);
  expect(contract.selectedStage.background).toBe(colors.acid);
  expect(contract.selectedStage.shadow).toContain("inset");
  expect(contract.panel.background).toBe(colors.paper);
  expect(contract.panel.border).toBe("2px");
  expect(contract.panel.shadow).toContain("8px 8px");
  expect(contract.receipt).toBe(colors.acid);
  expect(contract.chip).toBe(colors.labBlue);
  expect(contract.takeaway).toBe(colors.labBlue);

  await page.screenshot({
    path: "test-results/art-direction-agent-loop.png",
    fullPage: true,
  });
});

test("both routes collapse decorative motion when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const homeMotion = await page.evaluate(() => {
    const status = getComputedStyle(document.querySelector(".status-dot")!);
    const action = getComputedStyle(document.querySelector(".primary-link")!);
    return {
      statusDuration: Number.parseFloat(status.animationDuration),
      statusIterations: status.animationIterationCount,
      actionDuration: Number.parseFloat(action.transitionDuration),
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });

  expect(homeMotion.statusDuration).toBeLessThanOrEqual(0.00001);
  expect(homeMotion.statusIterations).toBe("1");
  expect(homeMotion.actionDuration).toBeLessThanOrEqual(0.00001);
  expect(homeMotion.scrollBehavior).toBe("auto");

  await page.goto("/labs/agent-loop/");
  await page.getByRole("tab", { name: /decide/i }).click();

  const labMotion = await page.evaluate(() => {
    const status = getComputedStyle(document.querySelector(".lab-status-dot")!);
    const panel = getComputedStyle(document.querySelector(".trace-panel")!);
    return {
      statusName: status.animationName,
      panelTransform: panel.transform,
      panelDuration: Number.parseFloat(panel.transitionDuration),
    };
  });

  expect(labMotion.statusName).toBe("none");
  expect(labMotion.panelTransform).toBe("none");
  expect(labMotion.panelDuration).toBeLessThanOrEqual(0.00001);
});
