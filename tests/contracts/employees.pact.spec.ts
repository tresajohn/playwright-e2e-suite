import { test, expect } from '@playwright/test';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { request } from '@playwright/test';
import { OrangeHRMApiClient } from '../api/orangehrm-api.client';
import { PACT_CONFIG } from './pact.config';

const { eachLike, integer, string: pactString } = MatchersV3;

const provider = new PactV3({
  consumer: PACT_CONFIG.consumer,
  provider: PACT_CONFIG.provider,
  dir: PACT_CONFIG.dir,
  logLevel: 'error',
});

test.describe('Employees Pact', () => {
  test('list employees contract', async () => {
    await provider
      .addInteraction({
        states: [],
        uponReceiving: 'a request to list employees',
        withRequest: {
          method: 'GET',
          path: '/web/index.php/api/v2/pim/employees',
          query: { limit: '50', offset: '0' },
        },
        willRespondWith: {
          status: 200,
          body: {
            data: eachLike({
              empNumber: integer(1),
              firstName: pactString('John'),
              lastName: pactString('Smith'),
              employeeId: pactString('001'),
              terminationId: null,
            }),
            meta: { total: integer(1) },
          },
        },
      })
      .executeTest(async (mockServer) => {
        const ctx = await request.newContext({ baseURL: mockServer.url });
        try {
          const client = new OrangeHRMApiClient(ctx);
          const { response, body } = await client.getEmployees();
          expect(response.status()).toBe(200);
          expect(Array.isArray(body.data)).toBe(true);
        } finally {
          await ctx.dispose();
        }
      });
  });

  test('get single employee contract', async () => {
    await provider
      .addInteraction({
        states: [],
        uponReceiving: 'a request for a specific employee',
        withRequest: {
          method: 'GET',
          path: '/web/index.php/api/v2/pim/employees/1',
        },
        willRespondWith: {
          status: 200,
          body: {
            data: {
              empNumber: integer(1),
              firstName: pactString('John'),
              lastName: pactString('Smith'),
              employeeId: pactString('001'),
              terminationId: null,
            },
          },
        },
      })
      .executeTest(async (mockServer) => {
        const ctx = await request.newContext({ baseURL: mockServer.url });
        try {
          const client = new OrangeHRMApiClient(ctx);
          const { response, body } = await client.getEmployee(1);
          expect(response.status()).toBe(200);
          expect(body.data.empNumber).toBe(1);
        } finally {
          await ctx.dispose();
        }
      });
  });
});
