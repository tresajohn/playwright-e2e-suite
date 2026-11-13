import { test, expect } from '../../fixtures/auth.fixture';
import { OrangeHRMApiClient } from '../../api/orangehrm-api.client';

test.describe('Leave Types API', () => {
  let api: OrangeHRMApiClient;

  test.beforeEach(async ({ apiContext }) => {
    api = new OrangeHRMApiClient(apiContext);
  });

  test('GET /leave/leave-types returns 200 @smoke @api', async () => {
    const { response, body } = await api.getLeaveTypes();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /leave/leave-types response matches leave type schema @regression @api', async () => {
    const { body } = await api.getLeaveTypes();
    const leaveType = body.data[0];

    expect(leaveType).toHaveProperty('id');
    expect(leaveType).toHaveProperty('name');
    expect(leaveType).toHaveProperty('deleted');
    expect(typeof leaveType.id).toBe('number');
    expect(typeof leaveType.name).toBe('string');
    expect(typeof leaveType.deleted).toBe('boolean');
  });

  test('GET /leave/leave-types returns only active leave types @regression @api', async () => {
    const { body } = await api.getLeaveTypes();
    const deleted = body.data.filter(lt => lt.deleted === true);

    expect(deleted.length).toBe(0);
  });

  test('GET /leave/leave-types meta total matches data count @regression @api', async () => {
    const { body } = await api.getLeaveTypes();

    expect(body.meta.total).toBe(body.data.length);
  });
});
