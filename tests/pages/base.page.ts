import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly pageLoader: Locator;
  readonly toastMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageLoader = page.locator('.oxd-loading-spinner');
    this.toastMessage = page.locator('.oxd-toast');
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageLoader.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  }

  async getToastMessage(): Promise<string> {
    await this.toastMessage.waitFor({ state: 'visible' });
    return this.toastMessage.innerText();
  }

  async expectToastSuccess(): Promise<void> {
    await expect(this.toastMessage).toBeVisible();
    await expect(this.toastMessage).toHaveClass(/oxd-toast--success/);
  }

  async clickNavMenuItem(label: string): Promise<void> {
    await this.page.getByRole('link', { name: label }).click();
    await this.waitForPageLoad();
  }

  async selectDropdownOption(label: string, optionText: string): Promise<void> {
    const dropdown = this.page.locator('.oxd-select-wrapper').filter({ hasText: label });
    await dropdown.click();
    await this.page.getByRole('option', { name: optionText }).click();
  }
}
