import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Auth API', () => {

  test('authenticated session can access protected employee endpoint @smoke @api', async ({ apiContext }) => {
    const response = await apiContext.get('/web/index.php/api/v2/pim/employees?limit=1');
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('authenticated session can access recruitment vacancies @regression @api', async ({ apiContext }) => {
    const response = await apiContext.get('/web/index.php/api/v2/recruitment/vacancies');
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  test('authenticated session can access leave types @regression @api', async ({ apiContext }) => {
    const response = await apiContext.get('/web/index.php/api/v2/leave/leave-types');

    expect(response.status()).toBe(200);
  });

  test('API responds within 5 seconds @regression @api', async ({ apiContext }) => {
    const start = Date.now();
    const response = await apiContext.get('/web/index.php/api/v2/pim/employees?limit=1');
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000);
  });
});
