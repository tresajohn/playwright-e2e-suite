import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class LeaveListPage extends BasePage {
  readonly tableHeader: Locator;
  readonly table: Locator;
  readonly leaveTypeDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.tableHeader = page.locator('.oxd-table-header');
    this.table = page.locator('.oxd-table');
    this.leaveTypeDropdown = page.locator('.oxd-select-wrapper').first();
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
