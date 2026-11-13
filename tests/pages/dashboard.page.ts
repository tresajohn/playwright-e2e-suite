import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly dashboardHeading: Locator;
  readonly quickLaunchWidget: Locator;
  readonly timeAtWorkWidget: Locator;
  readonly myActionsWidget: Locator;
  readonly userDropdown: Locator;
  readonly sideNavMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    this.quickLaunchWidget = page.locator('.orangehrm-quick-launch');
    this.timeAtWorkWidget = page.locator('.orangehrm-attendance-card');
    this.myActionsWidget = page.locator('.orangehrm-my-actions');
    this.userDropdown = page.locator('.oxd-userdropdown');
    this.sideNavMenu = page.locator('.oxd-sidepanel');
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
