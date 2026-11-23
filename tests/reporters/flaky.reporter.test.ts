import FlakyReporter from './flaky.reporter';

// Minimal stubs for Playwright Reporter types
function makeTest(id: string, title = 'Test Title', retries = 2) {
  return {
    id,
    retries,
    title,
    location: { file: 'tests/example.spec.ts', line: 1, column: 1 },
  } as unknown as import('@playwright/test/reporter').TestCase;
}

function makeResult(retry: number, status: string) {
  return { retry, status } as unknown as import('@playwright/test/reporter').TestResult;
}

const reporter = new FlakyReporter();

// Simulate: attempt 0 failed, attempt 1 failed, attempt 2 passed — passedOnAttempt: 2
const test1 = makeTest('test-1', 'flaky test');
reporter.onTestEnd(test1, makeResult(0, 'failed'));
reporter.onTestEnd(test1, makeResult(1, 'failed'));
reporter.onTestEnd(test1, makeResult(2, 'passed'));

// Simulate: clean pass on first attempt — not flaky
const test2 = makeTest('test-2', 'clean test');
reporter.onTestEnd(test2, makeResult(0, 'passed'));

// Use onEnd to build the report (without writing to disk — we inspect state directly)
// Access private field for unit-level testing
const attempts = (
  reporter as unknown as { attempts: Map<string, Array<{ retry: number; status: string }>> }
).attempts;

const test1Attempts = attempts.get('test-1');
if (!test1Attempts) throw new Error('No attempts recorded for test-1');
if (test1Attempts.length !== 3)
  throw new Error(`Expected 3 attempts for test-1, got ${test1Attempts.length}`);

const passedEntry = test1Attempts.find((a) => a.status === 'passed');
if (!passedEntry) throw new Error('No passed entry for test-1');
if (passedEntry.retry !== 2)
  throw new Error(`passedOnAttempt should be 2, got ${passedEntry.retry}`);

const hasFailure = test1Attempts.some((a) => a.status === 'failed');
if (!hasFailure) throw new Error('test-1 should have at least one failed attempt');

// test-2 should have exactly 1 attempt, all passed — not flaky
const test2Attempts = attempts.get('test-2');
if (!test2Attempts) throw new Error('No attempts recorded for test-2');
if (test2Attempts.some((a) => a.status === 'failed'))
  throw new Error('test-2 should not have any failures');

console.log('All FlakyReporter unit tests passed');
