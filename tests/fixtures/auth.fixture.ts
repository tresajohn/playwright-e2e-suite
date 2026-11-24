import { test as base, request as playwright, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { EmployeeListPage } from '../pages/pim/employee-list.page';
import { AddEmployeePage } from '../pages/pim/add-employee.page';
import { LoginModule } from '../modules/login.module';
import { EmployeeModule } from '../modules/employee.module';

// TEST-scoped: each fixture depends on `page`, which is test-scoped.
// A fresh page — and therefore a fresh POM instance — is created per test.
type OrangeHRMFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeeListPage: EmployeeListPage;
  addEmployeePage: AddEmployeePage;
  loginModule: LoginModule;
  employeeModule: EmployeeModule;
};

// WORKER-scoped: worker fixtures are declared separately and shared across
// all tests running in the same worker. An authenticated HTTP context carries
// no mutable browser state, so it is safe to reuse across parallel tests
// within a worker, avoiding the overhead of a new context per test.
type OrangeHRMWorkerFixtures = {
  apiContext: APIRequestContext;
};

export const test = base.extend<OrangeHRMFixtures, OrangeHRMWorkerFixtures>({
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

  loginModule: async ({ page }, use) => {
    await use(new LoginModule(page));
  },

  employeeModule: async ({ page }, use) => {
    await use(new EmployeeModule(page));
  },

  apiContext: [
    async ({}, use) => {
      const ctx = await playwright.newContext({
        baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
        storageState: 'playwright/.auth/admin.json',
        extraHTTPHeaders: { Accept: 'application/json' },
      });
      await use(ctx);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
