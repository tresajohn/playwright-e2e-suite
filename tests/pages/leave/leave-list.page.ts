import { type Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class LeaveListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get tableHeader() {
    return this.page.locator('.oxd-table-header');
  }
  get table() {
    return this.page.locator('.oxd-table');
  }
  get leaveTypeDropdown() {
    return this.page.locator('.oxd-select-wrapper').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveList', { waitUntil: 'domcontentloaded' });
    await this.page
      .getByRole('heading', { name: 'Leave List' })
      .waitFor({ state: 'visible', timeout: 30_000 });
  }

  async gotoApplyLeave(): Promise<void> {
    await this.page.goto('/web/index.php/leave/applyLeave', { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
  }

  async gotoEntitlements(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveEntitlements', {
      waitUntil: 'domcontentloaded',
    });
    await this.waitForPageLoad();
  }

  async gotoMyLeave(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewMyLeaveList', { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
  }

  async filterByFromDate(date: string): Promise<void> {
    await this.page.locator('input[placeholder="yyyy-dd-mm"]').first().fill(date);
    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.waitForPageLoad();
  }
}
