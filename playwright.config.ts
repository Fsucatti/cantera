import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests on the built site with a local database, served the way Cloudflare serves it.
 * AI calls are intercepted where a test sends one, so these tests use almost none of the daily allowance.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: { baseURL: "http://localhost:8789", channel: "msedge", trace: "retain-on-failure" },
  webServer: {
    command: "npx wrangler dev --port 8789",
    url: "http://localhost:8789",
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Edge"], viewport: { width: 1280, height: 800 } }, grepInvert: /@mobile/ },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "msedge" }, grep: /@mobile/ },
  ],
});
