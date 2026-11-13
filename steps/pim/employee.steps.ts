import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../../tests/fixtures/bdd.fixture';

const { Given, When, Then } = createBdd(test);

Given('I am on the Employee List page', async ({ employeeListPage }) => {
  await employeeListPage.goto();
});

When('I click the Add button on the employee list', async ({ employeeListPage }) => {
  await employeeListPage.addEmployeeButton.click();
  await employeeListPage.waitForPageLoad();
});

When('I search for employee by name {string}', async ({ employeeListPage }, name: string) => {
  await employeeListPage.searchByName(name);
});

When('I click the Reset button', async ({ employeeListPage }) => {
  await employeeListPage.resetButton.click();
});

When('I fill in first name {string} middle name {string} last name {string}', async ({ addEmployeePage }, first: string, middle: string, last: string) => {
  await addEmployeePage.fillEmployeeDetails(first, middle, last);
});

When('I click Save on the employee form', async ({ addEmployeePage }) => {
  await addEmployeePage.saveButton.click();
  await addEmployeePage.waitForPageLoad();
});

When('I clear the first name and last name fields', async ({ addEmployeePage }) => {
  await addEmployeePage.firstNameInput.clear();
  await addEmployeePage.lastNameInput.clear();
});

Then('I should see the employee list table', async ({ page }) => {
  await expect(page).toHaveURL(/viewEmployeeList/);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

Then('I should be on the Add Employee page', async ({ page }) => {
  await expect(page).toHaveURL(/addEmployee/);
  await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
});

Then('I should see employee search results', async ({ employeeListPage }) => {
  await expect(employeeListPage.employeeTable).toBeVisible();
});

Then('I should see the no records found message', async ({ employeeListPage }) => {
  await expect(employeeListPage.noRecordsFound).toBeVisible();
});

Then('the employee name search field should be empty', async ({ employeeListPage }) => {
  await expect(employeeListPage.employeeNameInput).toHaveValue('');
});

Then('the employee record should be saved', async ({ page }) => {
  await expect(page).toHaveURL(/pim\/(view|add)/);
  await expect(page.locator('.oxd-layout-context')).toBeVisible();
});

Then('I should see required field errors on the employee form', async ({ page }) => {
  const errors = page.locator('.oxd-input-field-error-message');
  await expect(errors.first()).toBeVisible();
});
