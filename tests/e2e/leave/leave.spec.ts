import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Leave Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/web/index.php/leave/viewLeaveList', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Leave List' }).waitFor({ state: 'visible', timeout: 30_000 });
  });

  test('should display leave list page @smoke', async ({ page }) => {
    await expect(page).toHaveURL(/viewLeaveList/);
    await expect(page.getByRole('heading', { name: 'Leave List' })).toBeVisible();
  });

  test('should display leave list table with headers @regression', async ({ page }) => {
    const tableHeader = page.locator('.oxd-table-header');
    await expect(tableHeader).toBeVisible();
    await expect(tableHeader.getByText('Leave Type')).toBeVisible();
    await expect(tableHeader.getByText('Status')).toBeVisible();
  });

  test('should navigate to Apply Leave page @regression', async ({ page }) => {
    await page.goto('/web/index.php/leave/applyLeave', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/applyLeave/);
    await expect(page.locator('.oxd-layout-context')).toBeVisible();
  });

  test('should display leave type dropdown on apply page @regression', async ({ page }) => {
    await page.goto('/web/index.php/leave/applyLeave', { waitUntil: 'domcontentloaded' });
    const leaveTypeDropdown = page.locator('.oxd-select-wrapper').first();
    await expect(leaveTypeDropdown).toBeVisible();
  });

  test('should navigate to Leave Entitlements @regression', async ({ page }) => {
    await page.goto('/web/index.php/leave/viewLeaveEntitlements', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/viewLeaveEntitlements/);
    await expect(page.locator('.oxd-layout-context')).toBeVisible();
  });

  test('should navigate to My Leave page @regression', async ({ page }) => {
    await page.goto('/web/index.php/leave/viewMyLeaveList', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/viewMyLeaveList/);
    await expect(page.locator('.oxd-layout-context')).toBeVisible();
  });

  test('should filter leave list by date range @regression', async ({ page }) => {
    const fromDateInput = page.locator('input[placeholder="yyyy-dd-mm"]').first();
    await fromDateInput.fill('2025-01-01');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('.oxd-table')).toBeVisible();
  });
});
