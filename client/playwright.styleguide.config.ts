import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const baseURL = 'http://localhost:3200';
const systemChrome = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (process.platform === 'win32' && existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : undefined);

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'public.spec.ts',
  grep: /development styleguide renders shared design examples/,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'off',
    ...(systemChrome ? { launchOptions: { executablePath: systemChrome } } : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev -p 3200',
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
