import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class AddEmployeePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get firstNameInput() {
    return this.page.getByPlaceholder('First Name');
  }
  get middleNameInput() {
    return this.page.getByPlaceholder('Middle Name');
  }
  get lastNameInput() {
    return this.page.getByPlaceholder('Last Name');
  }
  get employeeIdInput() {
    return this.page.locator('.orangehrm-employee-container .oxd-input').nth(0);
  }
  get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }
  get createLoginToggle() {
    return this.page.locator('.oxd-switch-input');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/pim/addEmployee', { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
  }

  async fillEmployeeDetails(
    firstName: string,
    middleName: string,
    lastName: string
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.middleNameInput.fill(middleName);
    await this.lastNameInput.fill(lastName);
  }

  async getEmployeeId(): Promise<string> {
    return this.employeeIdInput.inputValue();
  }

  async saveEmployee(): Promise<void> {
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  async expectPersonalDetailsPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/viewPersonalDetails/);
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  }
}
