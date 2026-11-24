import { type Page } from '@playwright/test';
import { LeaveListPage } from '../pages/leave/leave-list.page';

export class LeaveModule {
  readonly leaveListPage: LeaveListPage;

  constructor(page: Page) {
    this.leaveListPage = new LeaveListPage(page);
  }

  async navigateToLeaveList(): Promise<void> {
    await this.leaveListPage.goto();
  }

  async navigateToApplyLeave(): Promise<void> {
    await this.leaveListPage.gotoApplyLeave();
  }

  async navigateToEntitlements(): Promise<void> {
    await this.leaveListPage.gotoEntitlements();
  }

  async navigateToMyLeave(): Promise<void> {
    await this.leaveListPage.gotoMyLeave();
  }

  async filterByDateRange(fromDate: string): Promise<void> {
    await this.leaveListPage.filterByFromDate(fromDate);
  }
}
