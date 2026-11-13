import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../../tests/fixtures/bdd.fixture';
import { ADMIN_USER } from '../../tests/utils/test-data';

const { Given, When, Then, Before } = createBdd(test);

Before({ tags: '@no-auth' }, async ({ context }) => {
  await context.clearCookies();
});

Given('I am on the OrangeHRM login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('I enter valid admin credentials', async ({ loginPage }) => {
  await loginPage.usernameInput.fill(ADMIN_USER.username);
  await loginPage.passwordInput.fill(ADMIN_USER.password);
});

When('I enter username {string} and password {string}', async ({ loginPage }, username: string, password: string) => {
  await loginPage.usernameInput.fill(username);
  await loginPage.passwordInput.fill(password);
});

When('I click the login button', async ({ loginPage }) => {
  await loginPage.loginButton.click();
});

When('I type {string} into the password field', async ({ loginPage }, value: string) => {
  await loginPage.passwordInput.fill(value);
});

When('I click logout from the user menu', async ({ page }) => {
  await page.locator('.oxd-userdropdown').click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
});

Then('I should be redirected to the dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

Then('I should see an invalid credentials error', async ({ loginPage }) => {
  await loginPage.expectInvalidCredentialsError();
});

Then('the password field type should be {string}', async ({ loginPage }, type: string) => {
  await expect(loginPage.passwordInput).toHaveAttribute('type', type);
});

Then('I should be redirected to the login page', async ({ page }) => {
  await expect(page).toHaveURL(/auth\/login/);
});

Then('I should see required field validation errors', async ({ loginPage }) => {
  await loginPage.expectRequiredFieldError();
});
