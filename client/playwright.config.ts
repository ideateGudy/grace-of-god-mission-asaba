import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const baseURL = 'http://localhost:3100';
const systemChrome = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (process.platform === 'win32' && existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : undefined);

export default defineConfig({
  testDir: './tests/e2e',
  grepInvert: /development styleguide renders shared design examples/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], ...(systemChrome ? { launchOptions: { executablePath: systemChrome } } : {}) } }],
  webServer: {
    command: 'node node_modules/next/dist/bin/next start -p 3100',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      USE_MOCK_API: 'true',
      NEXT_PUBLIC_SITE_URL: baseURL,
      REVALIDATE_SECRET: 'playwright-revalidation-secret',
    },
  },
});
