import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { trace: "retain-on-failure" },
  projects: [
    {
      name: "development",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        baseURL: "http://127.0.0.1:5173/",
      },
    },
    {
      name: "production-root",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        baseURL: "http://127.0.0.1:4173/",
      },
    },
    {
      name: "github-pages-path",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        baseURL: "http://127.0.0.1:4173/IAM_Crawler_website/",
      },
    },
  ],
  webServer: [
    {
      command:
        "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
    },
    {
      command: "node scripts/serve-built.mjs",
      url: "http://127.0.0.1:4173/IAM_Crawler_website/",
      reuseExistingServer: true,
    },
  ],
});
