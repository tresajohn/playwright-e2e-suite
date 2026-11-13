import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../../tests/fixtures/bdd.fixture';

const { Given, When, Then } = createBdd(test);

Given('I am on the Leave List page', async ({ page }) => {
  await page.goto('/web/index.php/leave/viewLeaveList');
  await page.waitForLoadState('networkidle');
});

When('I navigate to the Apply Leave page', async ({ page }) => {
  await page.goto('/web/index.php/leave/applyLeave');
  await page.waitForLoadState('networkidle');
});

When('I navigate to the My Leave List page', async ({ page }) => {
  await page.goto('/web/index.php/leave/viewMyLeaveList');
  await page.waitForLoadState('networkidle');
});

When('I navigate to the Leave Entitlements page', async ({ page }) => {
  await page.goto('/web/index.php/leave/viewLeaveEntitlements');
  await page.waitForLoadState('networkidle');
});

Then('I should see the leave list page', async ({ page }) => {
  await expect(page).toHaveURL(/viewLeaveList/);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

Then('I should see leave type column in the table', async ({ page }) => {
  await expect(page.locator('.oxd-table-header').getByText('Leave Type')).toBeVisible();
});

Then('I should see status column in the table', async ({ page }) => {
  await expect(page.locator('.oxd-table-header').getByText('Status')).toBeVisible();
});

Then('I should be on the Apply Leave page', async ({ page }) => {
  await expect(page).toHaveURL(/applyLeave/);
  await expect(page.locator('.oxd-layout-context')).toBeVisible();
});

Then('I should see the leave type dropdown', async ({ page }) => {
  await expect(page.locator('.oxd-select-wrapper').first()).toBeVisible();
});

Then('I should be on the My Leave List page', async ({ page }) => {
  await expect(page).toHaveURL(/viewMyLeaveList/);
  await expect(page.locator('.oxd-layout-context')).toBeVisible();
});

Then('I should be on the Leave Entitlements page', async ({ page }) => {
  await expect(page).toHaveURL(/viewLeaveEntitlements/);
  await expect(page.locator('.oxd-layout-context')).toBeVisible();
});
