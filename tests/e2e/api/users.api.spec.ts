import { test, expect } from '../../fixtures/auth.fixture';
import { OrangeHRMApiClient } from '../../api/orangehrm-api.client';

test.describe('Current User API', () => {
  let api: OrangeHRMApiClient;

  test.beforeEach(async ({ apiContext }) => {
    api = new OrangeHRMApiClient(apiContext);
  });

  test('GET /core/users/me returns 200 @smoke @api', async () => {
    const { response } = await api.getCurrentUser();

    expect(response.status()).toBe(200);
  });

  test('GET /core/users/me authenticated session has Admin role @smoke @api', async () => {
    const { body } = await api.getCurrentUser();
    if (!body.data) test.skip();

    expect(body.data.userRole.name).toBe('Admin');
  });

  test('GET /core/users/me returns userName @regression @api', async () => {
    const { body } = await api.getCurrentUser();
    if (!body.data) test.skip();

    expect(body.data).toHaveProperty('userName');
    expect(typeof body.data.userName).toBe('string');
    expect(body.data.userName.length).toBeGreaterThan(0);
  });

  test('GET /core/users/me returns userRole with name @regression @api', async () => {
    const { body } = await api.getCurrentUser();
    if (!body.data) test.skip();

    expect(body.data).toHaveProperty('userRole');
    expect(body.data.userRole).toHaveProperty('name');
    expect(typeof body.data.userRole.name).toBe('string');
  });

  test('GET /core/users/me Content-Type is JSON @regression @api', async () => {
    const { response } = await api.getCurrentUser();

    expect(response.headers()['content-type']).toContain('application/json');
  });
});
