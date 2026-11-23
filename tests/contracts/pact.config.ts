import path from 'path';

export const PACT_CONFIG = {
  consumer: 'playwright-e2e-suite',
  provider: 'OrangeHRM-API',
  dir: path.resolve(process.cwd(), 'pacts'),
};
