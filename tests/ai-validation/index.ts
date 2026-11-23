/**
 * AI Test Validation Pipeline
 *
 * Runs four checks on AI-generated test scenarios before they can be promoted
 * to the live Playwright suite:
 *   1. Schema validation  — are scenarios well-formed?
 *   2. Traceability       — does every scenario map to a known requirement?
 *   3. Duplicate detection — are any scenarios functionally identical?
 *   4. Review gate        — has a human approved each scenario?
 *
 * Exit code 0 = all checks pass, 1 = one or more checks failed.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { validateScenarios } from './validate-scenarios';
import { checkTraceability, type Requirement } from './traceability';
import { detectDuplicates } from './duplicate-detector';
import { checkReviewGate } from './review-gate';

const FIXTURES = join(__dirname, 'fixtures');

const scenarios = JSON.parse(readFileSync(join(FIXTURES, 'generated-scenarios.json'), 'utf-8'));
const requirements: Requirement[] = JSON.parse(
  readFileSync(join(FIXTURES, 'requirements.json'), 'utf-8')
);

const PASS = '\x1b[32m✔\x1b[0m';
const FAIL = '\x1b[31m✖\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`\n${BOLD}═══════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}  AI Test Validation Pipeline${RESET}`);
console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}`);
console.log(`  Validating ${scenarios.length} AI-generated scenarios\n`);

let overallPass = true;

// ── 1. Schema Validation ─────────────────────────────────────────────────────
console.log(`${BOLD}[1/4] Schema Validation${RESET}`);
const validationResults = validateScenarios(scenarios);
const schemaFailures = validationResults.filter((r) => !r.valid);

if (schemaFailures.length === 0) {
  console.log(`  ${PASS} All ${scenarios.length} scenarios match the schema\n`);
} else {
  overallPass = false;
  console.log(`  ${FAIL} ${schemaFailures.length} scenario(s) failed schema validation:`);
  for (const failure of schemaFailures) {
    console.log(`     • ${failure.scenarioId}`);
    for (const error of failure.errors) {
      console.log(`       - ${error}`);
    }
  }
  console.log();
}

// ── 2. Traceability ──────────────────────────────────────────────────────────
console.log(`${BOLD}[2/4] Traceability Check${RESET}`);
const traceability = checkTraceability(scenarios, requirements);

if (traceability.unmappedScenarios.length === 0) {
  console.log(`  ${PASS} All scenarios map to a known requirement`);
} else {
  overallPass = false;
  console.log(
    `  ${FAIL} ${traceability.unmappedScenarios.length} scenario(s) reference unknown requirements:`
  );
  for (const id of traceability.unmappedScenarios) {
    const scenario = scenarios.find((s: { scenarioId: string }) => s.scenarioId === id);
    console.log(`     • ${id} → requirementId: "${scenario?.requirementId}" not found`);
  }
}

if (traceability.uncoveredRequirements.length === 0) {
  console.log(`  ${PASS} All requirements have at least one scenario\n`);
} else {
  console.log(
    `  ${WARN} ${traceability.uncoveredRequirements.length} requirement(s) have no scenario coverage:`
  );
  for (const id of traceability.uncoveredRequirements) {
    const req = requirements.find((r) => r.id === id);
    console.log(`     • ${id}: ${req?.title}`);
  }
  console.log();
}

// ── 3. Duplicate Detection ───────────────────────────────────────────────────
console.log(`${BOLD}[3/4] Duplicate Detection${RESET}`);
const duplicates = detectDuplicates(scenarios);

if (duplicates.length === 0) {
  console.log(`  ${PASS} No duplicate scenarios detected\n`);
} else {
  console.log(`  ${WARN} ${duplicates.length} potential duplicate pair(s) found (Jaccard ≥ 0.60):`);
  for (const pair of duplicates) {
    console.log(
      `     • ${pair.scenarioA} ↔ ${pair.scenarioB}  (similarity: ${(pair.similarity * 100).toFixed(0)}%)`
    );
  }
  console.log(`  Review these pairs and merge or remove redundant scenarios.\n`);
}

// ── 4. Review Gate ───────────────────────────────────────────────────────────
console.log(`${BOLD}[4/4] Human Review Gate${RESET}`);
const gate = checkReviewGate(scenarios);

console.log(`  ${PASS} Approved:  ${gate.approved.length} scenario(s)`);

if (gate.rejected.length > 0) {
  console.log(`  ${WARN} Rejected:  ${gate.rejected.join(', ')}`);
}

if (gate.blocked.length > 0) {
  overallPass = false;
  const pending = gate.blocked.filter((id) => !gate.rejected.includes(id));
  if (pending.length > 0) {
    console.log(`  ${FAIL} Pending review (blocked from promotion): ${pending.join(', ')}`);
  }
  console.log(`\n  These scenarios require human approval before entering the suite.`);
}

console.log();

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}`);
if (overallPass) {
  console.log(`${PASS} ${BOLD}All checks passed — scenarios are ready for promotion${RESET}`);
} else {
  console.log(`${FAIL} ${BOLD}One or more checks failed — resolve issues before promoting${RESET}`);
}
console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}\n`);

process.exit(overallPass ? 0 : 1);
