import { type Page } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';

export class DashboardModule {
  private readonly dashboardPage: DashboardPage;

  constructor(page: Page) {
    this.dashboardPage = new DashboardPage(page);
  }

  async goto(): Promise<void> {
    await this.dashboardPage.goto();
  }

  async expectLoaded(): Promise<void> {
    await this.dashboardPage.expectDashboardLoaded();
  }

  async expectNavMenuItemsVisible(): Promise<void> {
    await this.dashboardPage.expectNavMenuItemsVisible();
  }

  async navigateViaMenu(label: string): Promise<void> {
    await this.dashboardPage.clickNavMenuItem(label);
  }

  async getUserName(): Promise<string> {
    return this.dashboardPage.getUserName();
  }

  async logout(): Promise<void> {
    await this.dashboardPage.logout();
  }
}
