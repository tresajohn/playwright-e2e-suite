import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Dashboard', () => {

  test('should load dashboard after login @smoke', async ({ dashboardPage }) => {
    await dashboardPage.expectDashboardLoaded();
  });

  test('should display all main navigation menu items @smoke', async ({ dashboardPage }) => {
    await dashboardPage.expectNavMenuItemsVisible();
  });

  test('should display logged-in user name in header @regression', async ({ dashboardPage }) => {
    const userName = await dashboardPage.getUserName();
    expect(userName.trim().length).toBeGreaterThan(0);
  });

  test('should display Quick Launch widget @regression', async ({ dashboardPage }) => {
    await expect(dashboardPage.quickLaunchWidget).toBeVisible();
  });

  test('should navigate to PIM from sidebar @regression', async ({ dashboardPage, page }) => {
    await dashboardPage.clickNavMenuItem('PIM');
    await expect(page).toHaveURL(/viewEmployeeList/);
  });

  test('should navigate to Leave from sidebar @regression', async ({ dashboardPage, page }) => {
    await dashboardPage.clickNavMenuItem('Leave');
    await expect(page).toHaveURL(/viewLeaveList/);
  });

  test('should navigate to Recruitment from sidebar @regression', async ({ dashboardPage, page }) => {
    await dashboardPage.clickNavMenuItem('Recruitment');
    await expect(page).toHaveURL(/recruitment/);
  });

});
