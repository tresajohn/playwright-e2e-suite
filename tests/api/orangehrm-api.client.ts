import { APIRequestContext, APIResponse } from '@playwright/test';

export interface Employee {
  empNumber: number;
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
  terminationId: null | number;
}

export interface LeaveType {
  id: number;
  name: string;
  deleted: boolean;
}

export interface Vacancy {
  id: number;
  name: string;
  status: boolean;
  numOfPositions: number | null;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: { total: number };
}

export interface ApiSingleResponse<T> {
  data: T;
}

export class OrangeHRMApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private async safeJson(response: APIResponse): Promise<any> {
    try {
      return await this.safeJson(response);
    } catch {
      return {};
    }
  }

  async getEmployees(params: { limit?: number; offset?: number } = {}): Promise<{
    response: APIResponse;
    body: ApiListResponse<Employee>;
  }> {
    const { limit = 50, offset = 0 } = params;
    const response = await this.request.get(
      `/web/index.php/api/v2/pim/employees?limit=${limit}&offset=${offset}`
    );
    return { response, body: await this.safeJson(response) };
  }

  async getEmployee(empNumber: number): Promise<{
    response: APIResponse;
    body: ApiSingleResponse<Employee>;
  }> {
    const response = await this.request.get(
      `/web/index.php/api/v2/pim/employees/${empNumber}`
    );
    return { response, body: response.ok() ? await this.safeJson(response) : { data: null } as any };
  }

  async getLeaveTypes(): Promise<{
    response: APIResponse;
    body: ApiListResponse<LeaveType>;
  }> {
    const response = await this.request.get(
      '/web/index.php/api/v2/leave/leave-types'
    );
    return { response, body: await this.safeJson(response) };
  }

  async getVacancies(): Promise<{
    response: APIResponse;
    body: ApiListResponse<Vacancy>;
  }> {
    const response = await this.request.get(
      '/web/index.php/api/v2/recruitment/vacancies'
    );
    return { response, body: await this.safeJson(response) };
  }

  async getCurrentUser(): Promise<{
    response: APIResponse;
    body: { data: { userName: string; userRole: { name: string } } };
  }> {
    const response = await this.request.get(
      '/web/index.php/api/v2/core/users/me'
    );
    return { response, body: await this.safeJson(response) };
  }
}
