import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser } from "@playwright/test";
import sharp from "sharp";

const projectRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const outputPath = join(projectRoot, "public/assets/agent-loop-demo.gif");
const previewOrigin = "http://127.0.0.1:4322";
const captureUrl = `${previewOrigin}/labs/agent-loop/`;
const outputWidth = 960;
const maximumBytes = 3 * 1024 * 1024;

const stages = [
  { name: /observe/i, delay: 1_800 },
  { name: /decide/i, delay: 900 },
  { name: /tool call/i, delay: 900 },
  { name: /result/i, delay: 900 },
  { name: /verify/i, delay: 900 },
  { name: /stop/i, delay: 2_000 },
] as const;

function startPreview(): ChildProcessWithoutNullStreams {
  return spawn(
    "pnpm",
    ["preview", "--host", "127.0.0.1", "--port", "4322"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: "1",
      },
      stdio: "pipe",
    },
  );
}

async function waitForPreview(
  preview: ChildProcessWithoutNullStreams,
): Promise<void> {
  let previewLog = "";
  preview.stdout.on("data", (chunk: Buffer) => {
    previewLog += chunk.toString();
  });
  preview.stderr.on("data", (chunk: Buffer) => {
    previewLog += chunk.toString();
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (preview.exitCode !== null) {
      throw new Error(`Astro preview exited before capture.\n${previewLog.trim()}`);
    }

    try {
      const response = await fetch(captureUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // The preview server has not started listening yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${captureUrl}.\n${previewLog.trim()}`);
}

async function stopPreview(
  preview: ChildProcessWithoutNullStreams,
): Promise<void> {
  if (preview.exitCode !== null) {
    return;
  }

  preview.kill("SIGTERM");
  await Promise.race([
    new Promise<void>((resolve) => preview.once("exit", () => resolve())),
    new Promise<void>((resolve) => setTimeout(resolve, 2_000)),
  ]);
}

async function captureDemo(): Promise<void> {
  const preview = startPreview();
  let browser: Browser | undefined;

  try {
    await waitForPreview(preview);
    browser = await chromium.launch();

    const context = await browser.newContext({
      colorScheme: "light",
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    await page.goto(captureUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          caret-color: transparent !important;
          transition: none !important;
        }
      `,
    });

    const frame = page.locator(".simulator-frame");
    await frame.scrollIntoViewIfNeeded();
    const captureBox = await frame.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        x: box.left,
        y: box.top,
        width: box.width,
        height: box.height,
      };
    });

    const rawFrames: Buffer[] = [];
    let frameHeight = 0;
    let channels: 3 | 4 = 3;

    for (const stage of stages) {
      await page.getByRole("tab", { name: stage.name }).click();
      await page.waitForTimeout(50);
      const screenshot = await page.screenshot({
        animations: "disabled",
        clip: captureBox,
        type: "png",
      });
      const {
        data,
        info,
      } = await sharp(screenshot)
        .resize({ width: outputWidth, withoutEnlargement: true })
        .flatten({ background: "#f3f0e8" })
        .raw()
        .toBuffer({ resolveWithObject: true });

      if (rawFrames.length > 0 && info.height !== frameHeight) {
        throw new Error(
          `Captured frame height changed from ${frameHeight} to ${info.height}.`,
        );
      }

      frameHeight = info.height;
      channels = info.channels as 3 | 4;
      rawFrames.push(data);
    }

    const animation = await sharp(Buffer.concat(rawFrames), {
      raw: {
        width: outputWidth,
        height: frameHeight * rawFrames.length,
        channels,
        pageHeight: frameHeight,
      },
    })
      .gif({
        colors: 64,
        delay: stages.map((stage) => stage.delay),
        dither: 0.2,
        effort: 10,
        interFrameMaxError: 2,
        interPaletteMaxError: 8,
        loop: 0,
      })
      .toBuffer();

    if (animation.byteLength > maximumBytes) {
      throw new Error(
        `GIF is ${(animation.byteLength / 1024 / 1024).toFixed(2)} MiB; ` +
          `the budget is ${(maximumBytes / 1024 / 1024).toFixed(0)} MiB.`,
      );
    }

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, animation);

    const metadata = await sharp(animation, { animated: true }).metadata();
    if (
      metadata.width !== outputWidth ||
      metadata.pages !== stages.length ||
      metadata.loop !== 0
    ) {
      throw new Error(
        `Unexpected GIF metadata: ${JSON.stringify({
          width: metadata.width,
          height: metadata.pageHeight,
          pages: metadata.pages,
          loop: metadata.loop,
        })}`,
      );
    }

    console.log(`captured: ${outputPath}`);
    console.log(
      `gif: ${metadata.width}x${metadata.pageHeight} · ${metadata.pages} frames · ` +
        `${(animation.byteLength / 1024 / 1024).toFixed(2)} MiB · loops`,
    );
    console.log(`delays: ${metadata.delay?.join(", ")} ms`);
  } finally {
    await browser?.close();
    await stopPreview(preview);
  }
}

await captureDemo();
