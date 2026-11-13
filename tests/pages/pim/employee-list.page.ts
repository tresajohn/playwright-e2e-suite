import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class EmployeeListPage extends BasePage {
  readonly addEmployeeButton: Locator;
  readonly employeeNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly employeeTable: Locator;
  readonly noRecordsFound: Locator;

  constructor(page: Page) {
    super(page);
    this.addEmployeeButton = page.getByRole('button', { name: 'Add' });
    this.employeeNameInput = page.locator('input[placeholder="Type for hints..."]').first();
    this.employeeIdInput = page.locator('input[placeholder="Type here"]').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.employeeTable = page.locator('.oxd-table');
    this.noRecordsFound = page.getByText('No Records Found').first();
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
    const countText = await this.page.locator('.orangehrm-header-container').innerText().catch(() => '');
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
