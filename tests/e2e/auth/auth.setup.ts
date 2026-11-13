import { test as setup, expect } from '@playwright/test';
import { ADMIN_USER } from '../../utils/test-data';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Username').waitFor({ state: 'visible', timeout: 60_000 });
  await page.getByPlaceholder('Username').fill(ADMIN_USER.username);
  await page.getByPlaceholder('Password').fill(ADMIN_USER.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.context().storageState({ path: authFile });
});
