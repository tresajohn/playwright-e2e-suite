import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get dashboardHeading() {
    return this.page.getByRole('heading', { name: 'Dashboard' });
  }
  get quickLaunchWidget() {
    return this.page.locator('.orangehrm-quick-launch');
  }
  get timeAtWorkWidget() {
    return this.page.locator('.orangehrm-attendance-card');
  }
  get myActionsWidget() {
    return this.page.locator('.orangehrm-my-actions');
  }
  get userDropdown() {
    return this.page.locator('.oxd-userdropdown');
  }
  get sideNavMenu() {
    return this.page.locator('.oxd-sidepanel');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index', { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
  }

  async expectDashboardLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.dashboardHeading).toBeVisible();
  }

  async expectNavMenuItemsVisible(): Promise<void> {
    const navItems = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance'];
    for (const item of navItems) {
      await expect(this.sideNavMenu.getByText(item)).toBeVisible();
    }
  }

  async getUserName(): Promise<string> {
    return this.userDropdown.locator('.oxd-userdropdown-name').innerText();
  }

  async logout(): Promise<void> {
    await this.userDropdown.click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
    await this.page.waitForURL(/auth\/login/);
  }
}
