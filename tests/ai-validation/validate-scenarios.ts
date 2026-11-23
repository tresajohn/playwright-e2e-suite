import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { join } from 'path';

const ajv = new Ajv({ allErrors: true });

const schema = JSON.parse(
  readFileSync(join(__dirname, 'schemas/test-scenario.schema.json'), 'utf-8')
);

export interface ValidationResult {
  scenarioId: string;
  valid: boolean;
  errors: string[];
}

export function validateScenarios(scenarios: unknown[]): ValidationResult[] {
  const validate = ajv.compile(schema);

  return scenarios.map((scenario, index) => {
    const valid = validate(scenario);
    const id =
      typeof scenario === 'object' && scenario !== null && 'scenarioId' in scenario
        ? String((scenario as Record<string, unknown>).scenarioId)
        : `index[${index}]`;

    if (valid) {
      return { scenarioId: id, valid: true, errors: [] };
    }

    const errors = (validate.errors ?? []).map((e) => `${e.instancePath || '(root)'} ${e.message}`);
    return { scenarioId: id, valid: false, errors };
  });
}
