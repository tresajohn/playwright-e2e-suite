import { test, expect } from '../../fixtures/auth.fixture';
import { VACANCY_DATA } from '../../utils/test-data';

test.describe('Recruitment', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/web/index.php/recruitment/viewJobVacancy', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Vacancies' }).waitFor({ state: 'visible', timeout: 30_000 });
  });

  test('should display job vacancies page @smoke', async ({ page }) => {
    await expect(page).toHaveURL(/viewJobVacancy/);
    await expect(page.getByRole('heading', { name: 'Vacancies' })).toBeVisible();
  });

  test('should display Add Vacancy button @smoke', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });

  test('should navigate to Add Vacancy form @regression', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/recruitment/);
    await expect(page.locator('.oxd-layout-context')).toBeVisible();
  });

  test('should display vacancy form fields @regression', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('.oxd-select-wrapper').first()).toBeVisible();
    await expect(page.locator('.oxd-input').first()).toBeVisible();
  });

  test('should validate required fields on Add Vacancy form @regression', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    const errors = page.locator('.oxd-input-field-error-message');
    await expect(errors.first()).toBeVisible();
  });

  test('should search vacancies by job title @regression', async ({ page }) => {
    const jobTitleDropdown = page.locator('.oxd-select-wrapper').first();
    await jobTitleDropdown.click();
    const firstOption = page.getByRole('option').nth(1);
    await firstOption.click();
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('.oxd-table')).toBeVisible();
  });

  test('should navigate to Candidates page @regression', async ({ page }) => {
    await page.goto('/web/index.php/recruitment/viewCandidates', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Candidates' })).toBeVisible();
  });

  test('should display candidates table headers @regression', async ({ page }) => {
    await page.goto('/web/index.php/recruitment/viewCandidates', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.oxd-table')).toBeVisible();
  });
});
