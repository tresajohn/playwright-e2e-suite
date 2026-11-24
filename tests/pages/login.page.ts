import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get usernameInput() {
    return this.page.getByPlaceholder('Username');
  }
  get passwordInput() {
    return this.page.getByPlaceholder('Password');
  }
  get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }
  get errorAlert() {
    return this.page.locator('.oxd-alert-content-text');
  }
  get forgotPasswordLink() {
    return this.page.getByText('Forgot your password?');
  }
  get logoImage() {
    return this.page.locator('.orangehrm-login-logo');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText('Invalid credentials');
  }

  async expectRequiredFieldError(): Promise<void> {
    const requiredErrors = this.page.locator('.oxd-input-field-error-message');
    await expect(requiredErrors.first()).toBeVisible();
  }

  async expectLoginPageVisible(): Promise<void> {
    await expect(this.logoImage).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
