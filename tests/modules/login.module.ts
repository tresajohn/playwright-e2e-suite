import { type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

export class LoginModule {
  private readonly loginPage: LoginPage;

  constructor(private readonly page: Page) {
    this.loginPage = new LoginPage(page);
  }

  async login(username: string, password: string): Promise<void> {
    await this.loginPage.goto();
    await this.loginPage.login(username, password);
  }

  async logout(): Promise<void> {
    await this.page.locator('.oxd-userdropdown').click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
    await this.page.waitForURL(/auth\/login/);
  }

  async expectLoginPageVisible(): Promise<void> {
    await this.loginPage.expectLoginPageVisible();
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await this.loginPage.expectInvalidCredentialsError();
  }
}
