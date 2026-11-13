import { test as base, request as playwright, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { EmployeeListPage } from '../pages/pim/employee-list.page';
import { AddEmployeePage } from '../pages/pim/add-employee.page';

type OrangeHRMFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeeListPage: EmployeeListPage;
  addEmployeePage: AddEmployeePage;
  apiContext: APIRequestContext;
};

export const test = base.extend<OrangeHRMFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await use(dashboardPage);
  },

  employeeListPage: async ({ page }, use) => {
    const employeeListPage = new EmployeeListPage(page);
    await employeeListPage.goto();
    await use(employeeListPage);
  },

  addEmployeePage: async ({ page }, use) => {
    const addEmployeePage = new AddEmployeePage(page);
    await addEmployeePage.goto();
    await use(addEmployeePage);
  },

  apiContext: async ({}, use) => {
    const ctx = await playwright.newContext({
      baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
      storageState: 'playwright/.auth/admin.json',
      extraHTTPHeaders: { 'Accept': 'application/json' },
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from '@playwright/test';
