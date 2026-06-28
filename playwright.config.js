// Playwright config to run tests against local static server (dyngraph)
const { devices } = require('@playwright/test');

module.exports = {
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    baseURL: 'http://localhost:8000',
  },
  webServer: {
    command: 'python3 -m http.server 8000',
    port: 8000,
    timeout: 120000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }
  ]
};
