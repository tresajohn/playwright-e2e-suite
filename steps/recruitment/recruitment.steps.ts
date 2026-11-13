import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../../tests/fixtures/bdd.fixture';

const { Given, When, Then } = createBdd(test);

Given('I am on the Job Vacancies page', async ({ page }) => {
  await page.goto('/web/index.php/recruitment/viewJobVacancy');
  await page.waitForLoadState('networkidle');
});

When('I click the Add button on the vacancies page', async ({ page }) => {
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForLoadState('networkidle');
});

When('I submit the vacancy form without required fields', async ({ page }) => {
  await page.getByRole('button', { name: 'Save' }).click();
});

When('I select a job title from the vacancy search dropdown', async ({ page }) => {
  await page.locator('.oxd-select-wrapper').first().click();
  await page.getByRole('option').nth(1).click();
});

When('I click Search on the vacancies page', async ({ page }) => {
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForLoadState('networkidle');
});

When('I navigate to the Candidates page', async ({ page }) => {
  await page.goto('/web/index.php/recruitment/viewCandidates');
  await page.waitForLoadState('networkidle');
});

Then('I should see the vacancies page', async ({ page }) => {
  await expect(page).toHaveURL(/viewJobVacancy|viewCandidates/);
  await expect(page.locator('.oxd-layout-context')).toBeVisible();
});

Then('I should see the Add button', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
});

Then('I should see the Add Vacancy form', async ({ page }) => {
  await expect(page).toHaveURL(/recruitment/);
  await expect(page.locator('.oxd-layout-context')).toBeVisible();
});

Then('I should see the job title dropdown', async ({ page }) => {
  await expect(page.locator('.oxd-select-wrapper').first()).toBeVisible();
});

Then('I should see the vacancy name input', async ({ page }) => {
  await expect(page.locator('.oxd-input').first()).toBeVisible();
});

Then('I should see required field errors on the vacancy form', async ({ page }) => {
  const errors = page.locator('.oxd-input-field-error-message');
  await expect(errors.first()).toBeVisible();
});

Then('I should see the vacancies results table', async ({ page }) => {
  await expect(page.locator('.oxd-table')).toBeVisible();
});

Then('I should see the Candidates page', async ({ page }) => {
  await expect(page).toHaveURL(/viewCandidates/);
  await expect(page.locator('.oxd-layout-context')).toBeVisible();
});
