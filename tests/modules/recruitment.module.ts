import { type Page, type APIRequestContext } from '@playwright/test';
import { OrangeHRMApiClient } from '../api/orangehrm-api.client';
import { type VacancyData } from '../utils/test-data.factory';

export class RecruitmentModule {
  constructor(
    private readonly page: Page,
    private readonly apiContext: APIRequestContext
  ) {}

  async navigateToVacancies(): Promise<void> {
    await this.page.goto('/web/index.php/recruitment/viewJobVacancy', {
      waitUntil: 'domcontentloaded',
    });
    await this.page
      .getByRole('heading', { name: 'Vacancies' })
      .waitFor({ state: 'visible', timeout: 30_000 });
  }

  async addVacancy(data: VacancyData): Promise<number | undefined> {
    // Resolve a live hiring manager from the API so we're not coupled to
    // a hardcoded name that may not exist on the shared demo app.
    const client = new OrangeHRMApiClient(this.apiContext);
    const { body: empBody } = await client.getEmployees({ limit: 1 });
    const hiringManagerName = empBody.data[0]?.firstName ?? 'Admin';
    const searchPrefix = hiringManagerName.substring(0, 4);

    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.page.waitForURL(/addJobVacancy/);

    await this.page.locator('.oxd-select-wrapper').first().click();
    await this.page.getByRole('option', { name: data.jobTitle }).click();

    const vacancyNameInput = this.page.locator('.oxd-input').nth(1);
    await vacancyNameInput.fill(data.vacancyName);

    const hiringManagerInput = this.page.locator('.oxd-autocomplete-wrapper input').first();
    await hiringManagerInput.click();
    await hiringManagerInput.pressSequentially(searchPrefix, { delay: 150 });
    // Wait for loading to finish — the dropdown briefly shows "Searching..." then
    // replaces the list; clicking during the replacement lands on a stale node.
    await this.page
      .locator('.oxd-autocomplete-option')
      .filter({ hasNotText: 'Searching...' })
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.locator('.oxd-autocomplete-option').first().click();

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page
      .getByRole('heading', { name: 'Edit Vacancy' })
      .waitFor({ state: 'visible', timeout: 15_000 });

    const { body } = await client.getVacancies({ limit: 100 });
    const created = body.data.find((v) => v.name === data.vacancyName);
    return created?.id;
  }

  async searchByJobTitle(): Promise<void> {
    const jobTitleDropdown = this.page.locator('.oxd-select-wrapper').first();
    await jobTitleDropdown.click();
    const firstOption = this.page.getByRole('option').nth(1);
    await firstOption.click();
    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.locator('.oxd-table').waitFor({ state: 'visible' });
  }

  async navigateToCandidates(): Promise<void> {
    await this.page.goto('/web/index.php/recruitment/viewCandidates', {
      waitUntil: 'domcontentloaded',
    });
    await this.page
      .getByRole('heading', { name: 'Candidates' })
      .waitFor({ state: 'visible', timeout: 30_000 });
  }
}
