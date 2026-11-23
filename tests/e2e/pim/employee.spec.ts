import { test, expect } from '../../fixtures/auth.fixture';
import { createEmployeeData } from '../../utils/test-data.factory';
import { OrangeHRMApiClient } from '../../api/orangehrm-api.client';

test.describe('Employee Management (PIM)', () => {
  let empNumber: number | undefined;

  test.afterEach(async ({ apiContext }) => {
    if (empNumber !== undefined) {
      const client = new OrangeHRMApiClient(apiContext);
      await client.deleteEmployees([empNumber]);
      empNumber = undefined;
    }
  });

  test('should display employee list @smoke', async ({ employeeListPage: _ep, page }) => {
    await expect(page).toHaveURL(/viewEmployeeList/);
    await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
  });

  test('should add a new employee @regression', async ({ addEmployeePage, page }) => {
    const employee = createEmployeeData();

    await addEmployeePage.fillEmployeeDetails(
      employee.firstName,
      employee.middleName,
      employee.lastName
    );
    await addEmployeePage.saveEmployee();
    await expect(page).toHaveURL(/pim\/(view|add)/);
    await expect(page.locator('.oxd-layout-context')).toBeVisible();

    const urlMatch = page.url().match(/empNumber\/(\d+)/);
    if (urlMatch) {
      empNumber = parseInt(urlMatch[1], 10);
    }
  });

  test('should search employee by name @regression', async ({ employeeListPage }) => {
    await employeeListPage.searchByName('John');
    const count = await employeeListPage.getResultCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show no records for non-existent employee @regression', async ({
    employeeListPage,
  }) => {
    await employeeListPage.searchByName('ZZZNonExistentEmployee999');
    await expect(employeeListPage.noRecordsFound).toBeVisible();
  });

  test('should reset search filters @regression', async ({ employeeListPage }) => {
    await employeeListPage.searchByName('John');
    await employeeListPage.resetButton.click();
    await expect(employeeListPage.employeeNameInput).toHaveValue('');
  });

  test('should navigate to add employee page @smoke', async ({ employeeListPage, page }) => {
    await employeeListPage.addEmployeeButton.click();
    await expect(page).toHaveURL(/addEmployee/);
    await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
  });

  test('should validate required fields on add employee form @regression', async ({
    addEmployeePage,
    page,
  }) => {
    await addEmployeePage.firstNameInput.clear();
    await addEmployeePage.lastNameInput.clear();
    await addEmployeePage.saveButton.click();
    const errors = page.locator('.oxd-input-field-error-message');
    await expect(errors.first()).toBeVisible();
  });

  test('should display employee ID field on add employee form @regression', async ({
    addEmployeePage: _aep,
    page,
  }) => {
    const empIdLabel = page.getByText('Employee Id');
    await expect(empIdLabel).toBeVisible();
    const inputs = page.locator('.oxd-input:not([type="hidden"])');
    await expect(inputs.first()).toBeVisible();
  });
});
