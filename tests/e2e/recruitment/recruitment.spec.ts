import { test, expect } from '../../fixtures/auth.fixture';
import { createVacancyData } from '../../utils/test-data.factory';
import { OrangeHRMApiClient } from '../../api/orangehrm-api.client';

test.describe('Recruitment', () => {
  let vacancyId: number | undefined;

  test.beforeEach(async ({ page }) => {
    await page.goto('/web/index.php/recruitment/viewJobVacancy', { waitUntil: 'domcontentloaded' });
    await page
      .getByRole('heading', { name: 'Vacancies' })
      .waitFor({ state: 'visible', timeout: 30_000 });
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

  test('should add a new vacancy @regression', async ({ page, apiContext }) => {
    const vacancy = createVacancyData();

    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/addJobVacancy/);

    // Job Title dropdown
    await page.locator('.oxd-select-wrapper').first().click();
    await page.getByRole('option', { name: vacancy.jobTitle }).click();

    // Vacancy Name — second visible input (first is hidden employee ID)
    const vacancyNameInput = page.locator('.oxd-input').nth(1);
    await vacancyNameInput.fill(vacancy.vacancyName);

    // Hiring Manager autocomplete — pressSequentially fires Vue's debounce handler per
    // keystroke. The dropdown briefly shows "Searching..." while results load; filter
    // that out and wait for a real employee option before clicking.
    const hiringManagerInput = page.locator('.oxd-autocomplete-wrapper input').first();
    await hiringManagerInput.click();
    await hiringManagerInput.pressSequentially('Admin', { delay: 150 });
    const firstRealOption = page
      .locator('.oxd-autocomplete-option')
      .filter({ hasNotText: 'Searching...' })
      .first();
    await firstRealOption.waitFor({ state: 'visible', timeout: 10_000 });
    await firstRealOption.click();

    await page.getByRole('button', { name: 'Save' }).click();
    // OrangeHRM converts the form to edit mode in-place after a successful save (the
    // URL stays on addJobVacancy). A validation failure keeps the title 'Add Vacancy'.
    await expect(page.getByRole('heading', { name: 'Edit Vacancy' })).toBeVisible({
      timeout: 15_000,
    });

    // Locate the created vacancy by its unique name for teardown.
    // Use a large limit so a busy demo server doesn't paginate it out.
    const client = new OrangeHRMApiClient(apiContext);
    const { body } = await client.getVacancies({ limit: 100 });
    const created = body.data.find((v) => v.name === vacancy.vacancyName);
    expect(
      created,
      `Vacancy '${vacancy.vacancyName}' not found after save — creation may have failed`
    ).toBeDefined();
    vacancyId = created!.id;
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
