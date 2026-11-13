import { test, expect } from '../../fixtures/auth.fixture';
import { OrangeHRMApiClient } from '../../api/orangehrm-api.client';

test.describe('Recruitment Vacancies API', () => {
  let api: OrangeHRMApiClient;

  test.beforeEach(async ({ apiContext }) => {
    api = new OrangeHRMApiClient(apiContext);
  });

  test('GET /recruitment/vacancies returns 200 with data array @smoke @api', async () => {
    const { response, body } = await api.getVacancies();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body).toHaveProperty('meta');
  });

  test('GET /recruitment/vacancies response matches vacancy schema @regression @api', async () => {
    const { body } = await api.getVacancies();
    if (body.data.length === 0) test.skip();

    const vacancy = body.data[0];
    expect(vacancy).toHaveProperty('id');
    expect(vacancy).toHaveProperty('name');
    expect(vacancy).toHaveProperty('status');
    expect(typeof vacancy.id).toBe('number');
    expect(typeof vacancy.name).toBe('string');
    expect(typeof vacancy.status).toBe('boolean');
  });

  test('GET /recruitment/vacancies numOfPositions is number or null @regression @api', async () => {
    const { body } = await api.getVacancies();
    if (body.data.length === 0) test.skip();

    for (const vacancy of body.data) {
      const valid = vacancy.numOfPositions === null || typeof vacancy.numOfPositions === 'number';
      expect(valid).toBe(true);
    }
  });

  test('GET /recruitment/vacancies meta total matches data length @regression @api', async () => {
    const { body } = await api.getVacancies();

    expect(body.meta.total).toBe(body.data.length);
  });

  test('GET /recruitment/vacancies Content-Type is JSON @regression @api', async () => {
    const { response } = await api.getVacancies();

    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('GET /recruitment/vacancies responds within 5 seconds @regression @api', async () => {
    const start = Date.now();
    const { response } = await api.getVacancies();
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000);
  });
});
