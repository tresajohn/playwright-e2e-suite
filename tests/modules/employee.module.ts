import { type Page } from '@playwright/test';
import { EmployeeListPage } from '../pages/pim/employee-list.page';
import { AddEmployeePage } from '../pages/pim/add-employee.page';
import { type EmployeeData } from '../utils/test-data.factory';

export class EmployeeModule {
  private readonly list: EmployeeListPage;
  private readonly add: AddEmployeePage;

  constructor(private readonly page: Page) {
    this.list = new EmployeeListPage(page);
    this.add = new AddEmployeePage(page);
  }

  async addEmployee(data: EmployeeData): Promise<number | undefined> {
    await this.add.goto();
    await this.add.fillEmployeeDetails(data.firstName, data.middleName, data.lastName);
    await this.add.saveEmployee();
    const match = this.page.url().match(/empNumber\/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  async searchByName(name: string): Promise<number> {
    await this.list.goto();
    await this.list.searchByName(name);
    return this.list.getResultCount();
  }

  async searchById(id: string): Promise<number> {
    await this.list.goto();
    await this.list.searchById(id);
    return this.list.getResultCount();
  }

  get listPage(): EmployeeListPage {
    return this.list;
  }
}
