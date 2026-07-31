import { defineConfig } from "@playwright/test";

const liveSiteUrl = process.env.LIVE_SITE_URL;

if (!liveSiteUrl) {
  throw new Error("LIVE_SITE_URL is required for production verification");
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: liveSiteUrl,
    trace: "retain-on-failure",
  },
});
