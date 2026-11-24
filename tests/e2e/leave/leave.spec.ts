import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Leave Management', () => {
  test('should display leave list page @smoke', async ({ leaveModule, page }) => {
    await leaveModule.navigateToLeaveList();
    await expect(page).toHaveURL(/viewLeaveList/);
    await expect(page.getByRole('heading', { name: 'Leave List' })).toBeVisible();
  });

  test('should display leave list table with headers @regression', async ({ leaveModule }) => {
    await leaveModule.navigateToLeaveList();
    await expect(leaveModule.leaveListPage.tableHeader).toBeVisible();
    await expect(leaveModule.leaveListPage.tableHeader.getByText('Leave Type')).toBeVisible();
    await expect(leaveModule.leaveListPage.tableHeader.getByText('Status')).toBeVisible();
  });

  test('should navigate to Apply Leave page @regression', async ({ leaveModule, page }) => {
    await leaveModule.navigateToApplyLeave();
    await expect(page).toHaveURL(/applyLeave/);
    await expect(page.locator('.oxd-layout-context')).toBeVisible();
  });

  test('should display leave type dropdown on apply page @regression', async ({ leaveModule }) => {
    await leaveModule.navigateToApplyLeave();
    await expect(leaveModule.leaveListPage.leaveTypeDropdown).toBeVisible();
  });

  test('should navigate to Leave Entitlements @regression', async ({ leaveModule, page }) => {
    await leaveModule.navigateToEntitlements();
    await expect(page).toHaveURL(/viewLeaveEntitlements/);
    await expect(page.locator('.oxd-layout-context')).toBeVisible();
  });

  test('should navigate to My Leave page @regression', async ({ leaveModule, page }) => {
    await leaveModule.navigateToMyLeave();
    await expect(page).toHaveURL(/viewMyLeaveList/);
    await expect(page.locator('.oxd-layout-context')).toBeVisible();
  });

  test('should filter leave list by date range @regression', async ({ leaveModule }) => {
    await leaveModule.navigateToLeaveList();
    await leaveModule.filterByDateRange('2025-01-01');
    await expect(leaveModule.leaveListPage.table).toBeVisible();
  });
});
