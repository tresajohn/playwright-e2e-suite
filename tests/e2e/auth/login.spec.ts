import { test, expect } from '../../fixtures/auth.fixture';
import { ADMIN_USER, INVALID_USER } from '../../utils/test-data';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {

  test('should display login page elements @smoke', async ({ loginPage }) => {
    await loginPage.expectLoginPageVisible();
  });

  test('should login successfully with valid admin credentials @smoke', async ({ loginPage, page }) => {
    await loginPage.login(ADMIN_USER.username, ADMIN_USER.password);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show error for invalid username and password @regression', async ({ loginPage }) => {
    await loginPage.login(INVALID_USER.username, INVALID_USER.password);
    await loginPage.expectInvalidCredentialsError();
  });

  test('should show error for valid username with wrong password @regression', async ({ loginPage }) => {
    await loginPage.login(ADMIN_USER.username, 'WrongPassword123!');
    await loginPage.expectInvalidCredentialsError();
  });

  test('should show required field errors when submitting empty form @regression', async ({ loginPage, page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await loginPage.expectRequiredFieldError();
  });

  test('should navigate to forgot password page @regression', async ({ loginPage, page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  });

  test('should mask password field input @regression', async ({ loginPage }) => {
    await loginPage.passwordInput.fill('secretpassword');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('should logout successfully and redirect to login @smoke', async ({ loginPage, page }) => {
    await loginPage.login(ADMIN_USER.username, ADMIN_USER.password);
    await expect(page).toHaveURL(/dashboard/);
    await page.locator('.oxd-userdropdown').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
    await loginPage.expectLoginPageVisible();
  });

  test('should clear fields and re-login after failed attempt @regression', async ({ loginPage, page }) => {
    await loginPage.login(INVALID_USER.username, INVALID_USER.password);
    await loginPage.expectInvalidCredentialsError();

    await loginPage.usernameInput.clear();
    await loginPage.passwordInput.clear();
    await loginPage.login(ADMIN_USER.username, ADMIN_USER.password);
    await expect(page).toHaveURL(/dashboard/);
  });
});
