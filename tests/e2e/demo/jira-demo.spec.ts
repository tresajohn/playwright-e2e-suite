/**
 * JIRA INTEGRATION DEMO — Intentional Failure Test
 *
 * Purpose: This test is deliberately written to fail so that the custom Jira reporter
 * (tests/reporters/jira.reporter.ts) can be observed creating a bug ticket automatically.
 *
 * What it does:
 *   1. Navigates to the PIM Employee List (a real, authenticated page).
 *   2. Asserts that the page heading reads "Employee Records" — a value that does not exist.
 *      The actual heading is "Employee Information".
 *   3. The assertion fails → the Jira reporter fires → a bug ticket is created in KAN.
 *
 * This is intentional. Do not fix the assertion.
 * See README.md → "Jira Integration" for the full explanation.
 */
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Jira Integration Demo @regression', () => {

  test('[DEMO] PIM page heading displays correct title @regression', async ({ page }) => {
    test.skip(!!process.env.CI, 'Intentional failure demo — skipped in CI to avoid blocking the pipeline');

    await page.goto('/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });

    // INTENTIONAL FAILURE — The actual heading is "Employee Information".
    // Asserting "Employee Records" to trigger a predictable, meaningful failure
    // and demonstrate the Jira auto-ticket pipeline.
    await expect(
      page.getByRole('heading', { name: 'Employee Records' })
    ).toBeVisible({ timeout: 10_000 });
  });

});
