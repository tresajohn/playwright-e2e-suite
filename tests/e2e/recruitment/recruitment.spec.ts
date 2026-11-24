import { test, expect } from '../../fixtures/auth.fixture';
import { createVacancyData } from '../../utils/test-data.factory';
import { OrangeHRMApiClient } from '../../api/orangehrm-api.client';

test.describe('Recruitment', () => {
  let vacancyId: number | undefined;

  test.beforeEach(async ({ recruitmentModule }) => {
    await recruitmentModule.navigateToVacancies();
  });

  test.afterEach(async ({ apiContext }) => {
    if (vacancyId !== undefined) {
      const client = new OrangeHRMApiClient(apiContext);
      const response = await client.deleteVacancies([vacancyId]);
      expect(
        response.ok(),
        `Failed to delete vacancy ${vacancyId}: HTTP ${response.status()}`
      ).toBeTruthy();
      vacancyId = undefined;
    }
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

  test('should add a new vacancy @regression', async ({ recruitmentModule, page }) => {
    const vacancy = createVacancyData();
    vacancyId = await recruitmentModule.addVacancy(vacancy);
    await expect(page.getByRole('heading', { name: 'Edit Vacancy' })).toBeVisible();
    expect(vacancyId, `Vacancy '${vacancy.vacancyName}' not found after save`).toBeDefined();
  });

  test('should search vacancies by job title @regression', async ({ recruitmentModule, page }) => {
    await recruitmentModule.searchByJobTitle();
    await expect(page.locator('.oxd-table')).toBeVisible();
  });

  test('should navigate to Candidates page @regression', async ({ recruitmentModule, page }) => {
    await recruitmentModule.navigateToCandidates();
    await expect(page.getByRole('heading', { name: 'Candidates' })).toBeVisible();
  });

  test('should display candidates table headers @regression', async ({ recruitmentModule, page }) => {
    await recruitmentModule.navigateToCandidates();
    await expect(page.locator('.oxd-table')).toBeVisible();
  });
});
