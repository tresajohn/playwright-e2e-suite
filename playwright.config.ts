import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';

dotenv.config();

const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'tests/fixtures/bdd.fixture.ts'],
});

export default defineConfig({
  testDir: './tests/e2e',

  // Each test runs in its own isolated browser context, so full parallelism is safe.
  // Tests against the shared OrangeHRM demo app intentionally use workers:1 in CI
  // to avoid data conflicts (e.g. two parallel tests creating the same employee ID).
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // local retries hide flakiness — fix root causes instead
  workers: process.env.CI ? 1 : undefined, // CI: serialize against shared demo app; local: auto-detect

  globalTimeout: 10 * 60 * 1_000, // prevent hung CI runs
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: false }],
    ['./tests/reporters/jira.reporter.ts'],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // ── POM Tests ──
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
    // ── BDD Tests ──
    {
      name: 'bdd-chromium',
      testDir: bddTestDir,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
    // ── API Tests ──
    {
      name: 'api',
      testMatch: '**/*.api.spec.ts',
      use: {
        baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
        storageState: 'playwright/.auth/admin.json',
        extraHTTPHeaders: { Accept: 'application/json' },
      },
      dependencies: ['setup'],
    },
  ],
});
