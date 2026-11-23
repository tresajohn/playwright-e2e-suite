import { test, expect } from '@playwright/test';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { request } from '@playwright/test';
import { OrangeHRMApiClient } from '../api/orangehrm-api.client';
import { PACT_CONFIG } from './pact.config';

const { eachLike, integer, string: pactString, boolean: pactBoolean } = MatchersV3;

const provider = new PactV3({
  consumer: PACT_CONFIG.consumer,
  provider: PACT_CONFIG.provider,
  dir: PACT_CONFIG.dir,
  logLevel: 'error',
});

test.describe('Vacancies Pact', () => {
  test('list job vacancies contract', async () => {
    await provider
      .addInteraction({
        states: [],
        uponReceiving: 'a request to list job vacancies',
        withRequest: {
          method: 'GET',
          path: '/web/index.php/api/v2/recruitment/vacancies',
        },
        willRespondWith: {
          status: 200,
          body: {
            data: eachLike({
              id: integer(1),
              name: pactString('QA Engineer'),
              status: pactBoolean(true),
              numOfPositions: integer(1),
            }),
            meta: { total: integer(1) },
          },
        },
      })
      .executeTest(async (mockServer) => {
        const ctx = await request.newContext({ baseURL: mockServer.url });
        try {
          const client = new OrangeHRMApiClient(ctx);
          const { response, body } = await client.getVacancies();
          expect(response.status()).toBe(200);
          expect(Array.isArray(body.data)).toBe(true);
        } finally {
          await ctx.dispose();
        }
      });
  });
});
