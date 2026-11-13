import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class AddEmployeePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly saveButton: Locator;
  readonly createLoginToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.employeeIdInput = page.locator('.orangehrm-employee-container .oxd-input').nth(0);
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.createLoginToggle = page.locator('.oxd-switch-input');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/pim/addEmployee', { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
  }

  async fillEmployeeDetails(firstName: string, middleName: string, lastName: string): Promise<void> {
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
