import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class EmployeeListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get addEmployeeButton() {
    return this.page.getByRole('button', { name: 'Add' });
  }
  get employeeNameInput() {
    return this.page.locator('input[placeholder="Type for hints..."]').first();
  }
  get employeeIdInput() {
    return this.page.locator('input[placeholder="Type here"]').nth(1);
  }
  get searchButton() {
    return this.page.getByRole('button', { name: 'Search' });
  }
  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset' });
  }
  get employeeTable() {
    return this.page.locator('.oxd-table');
  }
  get noRecordsFound() {
    return this.page.getByText('No Records Found').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
  }

  async searchByName(name: string): Promise<void> {
    await this.employeeNameInput.fill(name);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async searchById(employeeId: string): Promise<void> {
    await this.employeeIdInput.fill(employeeId);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async getResultCount(): Promise<number> {
    const countLocator = this.page.locator('.oxd-table-header .oxd-text').first();
    await countLocator.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    const countText = await this.page
      .locator('.orangehrm-header-container')
      .innerText()
      .catch(() => '');
    const match = countText.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async clickFirstEmployeeEditButton(): Promise<void> {
    await this.employeeTable.locator('button[title="Edit"]').first().click();
    await this.waitForPageLoad();
  }

  async deleteFirstEmployee(): Promise<void> {
    await this.employeeTable.locator('button[title="Delete"]').first().click();
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    await this.waitForPageLoad();
  }

  async expectEmployeeInResults(name: string): Promise<void> {
    await expect(this.employeeTable.getByText(name)).toBeVisible();
  }
}
