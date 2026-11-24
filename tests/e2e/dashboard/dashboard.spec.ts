import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Dashboard', () => {
  test('should load dashboard after login @smoke', async ({ dashboardModule }) => {
    await dashboardModule.expectLoaded();
  });

  test('should display all main navigation menu items @smoke', async ({ dashboardModule }) => {
    await dashboardModule.expectNavMenuItemsVisible();
  });

  test('should display logged-in user name in header @regression', async ({ dashboardModule }) => {
    const userName = await dashboardModule.getUserName();
    expect(userName.trim().length).toBeGreaterThan(0);
  });

  test('should display Quick Launch widget @regression', async ({ dashboardPage }) => {
    await expect(dashboardPage.quickLaunchWidget).toBeVisible();
  });

  test('should navigate to PIM from sidebar @regression', async ({ dashboardModule, page }) => {
    await dashboardModule.navigateViaMenu('PIM');
    await expect(page).toHaveURL(/viewEmployeeList/);
  });

  test('should navigate to Leave from sidebar @regression', async ({ dashboardModule, page }) => {
    await dashboardModule.navigateViaMenu('Leave');
    await expect(page).toHaveURL(/viewLeaveList/);
  });

  test('should navigate to Recruitment from sidebar @regression', async ({
    dashboardModule,
    page,
  }) => {
    await dashboardModule.navigateViaMenu('Recruitment');
    await expect(page).toHaveURL(/recruitment/);
  });
});
