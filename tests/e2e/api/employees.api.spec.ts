import { test, expect } from '../../fixtures/auth.fixture';
import { OrangeHRMApiClient } from '../../api/orangehrm-api.client';

test.describe('Employee API', () => {
  let api: OrangeHRMApiClient;

  test.beforeEach(async ({ apiContext }) => {
    api = new OrangeHRMApiClient(apiContext);
  });

  test('GET /pim/employees returns 200 with data array @smoke @api', async () => {
    const { response, body } = await api.getEmployees();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta.total).toBeGreaterThan(0);
  });

  test('GET /pim/employees response matches employee schema @regression @api', async () => {
    const { body } = await api.getEmployees({ limit: 1 });
    const employee = body.data[0];

    expect(employee).toHaveProperty('empNumber');
    expect(employee).toHaveProperty('firstName');
    expect(employee).toHaveProperty('lastName');
    expect(employee).toHaveProperty('employeeId');
    expect(typeof employee.empNumber).toBe('number');
    expect(typeof employee.firstName).toBe('string');
    expect(typeof employee.lastName).toBe('string');
  });

  test('GET /pim/employees supports limit pagination @regression @api', async () => {
    const { body: all } = await api.getEmployees({ limit: 50 });
    const { body: limited } = await api.getEmployees({ limit: 2 });

    expect(limited.data.length).toBeLessThanOrEqual(2);
    expect(limited.meta.total).toBe(all.meta.total);
  });

  test('GET /pim/employees offset parameter is accepted @regression @api', async () => {
    const { response: r1, body: page1 } = await api.getEmployees({ limit: 2, offset: 0 });
    const { response: r2, body: page2 } = await api.getEmployees({ limit: 2, offset: 2 });

    // Both requests must succeed — verifies offset param is accepted without error
    expect(r1.status()).toBe(200);
    expect(r2.status()).toBe(200);
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page2.data.length).toBeLessThanOrEqual(2);
    // Data ordering on the shared demo server is not deterministic — overlap is not asserted
  });

  test('GET /pim/employees/{id} returns 200 for existing employee @smoke @api', async () => {
    const { body: list } = await api.getEmployees({ limit: 1 });
    const empNumber = list.data[0]?.empNumber;
    if (!empNumber) test.skip();

    const { response, body } = await api.getEmployee(empNumber);

    expect(response.status()).toBe(200);
    expect(body.data.empNumber).toBe(empNumber);
  });

  test('GET /pim/employees/{id} returns error for non-existent ID @regression @api', async () => {
    const { response } = await api.getEmployee(999999);

    // OrangeHRM returns 422 (Unprocessable Entity) for invalid employee IDs
    expect(response.status()).toBe(422);
  });

  test('GET /pim/employees Content-Type is JSON @regression @api', async () => {
    const { response } = await api.getEmployees({ limit: 1 });
    const contentType = response.headers()['content-type'];

    expect(contentType).toContain('application/json');
  });
});
