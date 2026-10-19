const { defineConfig, devices } = require("@playwright/test");

const PORT = 8099;

module.exports = defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: `vue-cli-service serve --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // WEBPACK 4 (VUE CLI 4) NÃO RODA NO NODE 17+ SEM O PROVIDER LEGADO
    env: { NODE_OPTIONS: "--openssl-legacy-provider" },
  },
});
