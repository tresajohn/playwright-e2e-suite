# Structured Logger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scoped, level-filtered `Logger` class to `tests/utils/` and replace all `console.*` calls in the two reporters with it.

**Architecture:** A single `Logger` class holds a `context` string (the caller's name) and a global level filter. `formatMessage` outputs pretty text locally and a JSON line when `CI=true`. Task 1 builds and tests the logger in isolation; Task 2 wires it into the two reporters.

**Tech Stack:** TypeScript, Node.js built-ins only — zero new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-24-structured-logger-design.md`

## Global Constraints

- Zero new runtime dependencies — no winston, pino, or tslog
- Must pass `npm run validate` (typecheck + lint + prettier) after each commit
- Logger class shape matches Pramod's: `LogLevel` enum, `context` constructor arg, `static create()`, `static setLogLevel()`, `static getLogLevel()`, `.debug()`, `.info()`, `.warn()`, `.error(message, error?)`, `.step(n, desc)`, `.testStart(name)`, `.testEnd(name)`
- CI JSON keys: `ts`, `level`, `ctx`, `msg`; optional `error` key added only when the `error` arg is non-null

## Review Focus

1. **`error` arg is `undefined` vs omitted** — `error()` called with no second arg must not emit `"error":""` or `"error":null` in JSON output; the key must be absent entirely. Covered in Task 1 Step 1.
2. **`CI` env var is set to empty string** — `process.env.CI === ''` is falsy in JS; must use pretty format, not JSON. Covered in Task 1 Step 1.
3. **Level filter blocks lower levels** — `setLogLevel(WARN)` must silence `debug()` and `info()` calls. Covered in Task 1 Step 1.
4. **Reporter instantiates logger at class-field level** — logger created at field declaration time (not inside a method) must work since `this.page` is unavailable but `new Logger('ctx')` has no such dependency. Covered by Task 2 implementation.
5. **FlakyReporter's `console.error` is guarded by `process.env.CI`** — the guard must be preserved after the swap; the logger call replaces the `console.error` but the surrounding `if (thresholdExceeded && process.env.CI)` block must remain. Covered in Task 2 Step 3.

---

### Task 1: Logger utility

**Files:**
- Create: `tests/utils/logger.ts`
- Create: `tests/utils/index.ts`
- Test: `tests/utils/logger.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `export enum LogLevel { DEBUG = 'DEBUG', INFO = 'INFO', WARN = 'WARN', ERROR = 'ERROR' }`
  - `export class Logger` with constructor `(context: string)` and all methods listed in Global Constraints
  - `tests/utils/index.ts` barrel: `export { Logger, LogLevel } from './logger';`

- [ ] **Step 1: Write the failing tests in `tests/utils/logger.test.ts`**

```typescript
import { Logger, LogLevel } from './logger';

function capture(level: 'info' | 'warn' | 'error', fn: () => void): string {
  let captured = '';
  const orig = console[level];
  console[level] = (msg: string) => { captured = msg; };
  fn();
  console[level] = orig;
  return captured;
}

// pretty format (CI unset)
{
  delete process.env.CI;
  const logger = new Logger('TestCtx');
  const out = capture('info', () => logger.info('hello world'));
  if (!/\[INFO\]/.test(out)) throw new Error(`missing level in: ${out}`);
  if (!/\[TestCtx\]/.test(out)) throw new Error(`missing context in: ${out}`);
  if (!/hello world/.test(out)) throw new Error(`missing message in: ${out}`);
}

// JSON format (CI=true)
{
  process.env.CI = 'true';
  const logger = new Logger('CICtx');
  const out = capture('info', () => logger.info('structured'));
  const parsed = JSON.parse(out);
  if (parsed.level !== 'INFO') throw new Error(`level wrong: ${parsed.level}`);
  if (parsed.ctx !== 'CICtx') throw new Error(`ctx wrong: ${parsed.ctx}`);
  if (parsed.msg !== 'structured') throw new Error(`msg wrong: ${parsed.msg}`);
  if ('error' in parsed) throw new Error('error key must be absent when no error arg');
  delete process.env.CI;
}

// error() with error arg — JSON has error key
{
  process.env.CI = 'true';
  const logger = new Logger('ErrCtx');
  const out = capture('error', () => logger.error('boom', new Error('cause')));
  const parsed = JSON.parse(out);
  if (!('error' in parsed)) throw new Error('error key missing when error arg provided');
  delete process.env.CI;
}

// level filter: WARN blocks INFO
{
  Logger.setLogLevel(LogLevel.WARN);
  const logger = new Logger('FilterCtx');
  const out = capture('info', () => logger.info('should be silent'));
  if (out !== '') throw new Error(`info should be filtered at WARN level, got: ${out}`);
  Logger.setLogLevel(LogLevel.INFO);
}

// CI='' is falsy — pretty format not JSON
{
  process.env.CI = '';
  const logger = new Logger('EmptyCI');
  const out = capture('info', () => logger.info('empty ci'));
  if (/^\{/.test(out)) throw new Error(`should not be JSON when CI='', got: ${out}`);
  delete process.env.CI;
}

console.log('All Logger tests passed');
```

- [ ] **Step 2: Run to verify tests fail**

Run: `npx ts-node --project tsconfig.json tests/utils/logger.test.ts`
Expected: error — `Cannot find module './logger'`

- [ ] **Step 3: Implement `Logger` class in `tests/utils/logger.ts`**

Signatures:

```typescript
export enum LogLevel { DEBUG = 'DEBUG', INFO = 'INFO', WARN = 'WARN', ERROR = 'ERROR' }

export class Logger {
  private context: string;
  private static logLevel: LogLevel = LogLevel.INFO;

  constructor(context: string)
  static create(context: string): Logger
  static setLogLevel(level: LogLevel): void
  static getLogLevel(): LogLevel
  private formatMessage(level: LogLevel, message: string): string  // pretty or JSON based on process.env.CI
  private shouldLog(level: LogLevel): boolean
  debug(message: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string, error?: unknown): void
  step(stepNumber: number, description: string): void   // delegates to info()
  testStart(testName: string): void                     // delegates to info()
  testEnd(testName: string): void                       // delegates to info()
}
```

`formatMessage`: when `process.env.CI` is truthy, return `JSON.stringify({ ts, level, ctx, msg, ...error })` where the `error` spread is `error ? { error: String(error) } : {}`. When falsy, return `` `[${ts}] [${level}] [${context}] ${message}` ``.

`error()`: call `console.error(this.formatMessage(...))` only; do not pass a second arg — the error value is embedded in the formatted string.

- [ ] **Step 4: Create `tests/utils/index.ts`**

```typescript
export { Logger, LogLevel } from './logger';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx ts-node --project tsconfig.json tests/utils/logger.test.ts`
Expected: `All Logger tests passed`

- [ ] **Step 6: Run validate**

Run: `npm run validate`
Expected: all checks pass

- [ ] **Step 7: Commit**

```bash
git add tests/utils/logger.ts tests/utils/index.ts tests/utils/logger.test.ts
git commit -m "feat: add structured Logger utility with CI-aware output"
```

---

### Task 2: Wire logger into reporters

**Files:**
- Modify: `tests/reporters/jira.reporter.ts`
- Modify: `tests/reporters/flaky.reporter.ts`

**Interfaces:**
- Consumes: `Logger`, `LogLevel` from `'../utils/logger'`
- Produces: nothing (no new exports)

- [ ] **Step 1: Confirm current console call count**

Run: `grep -c "console\." tests/reporters/jira.reporter.ts tests/reporters/flaky.reporter.ts`
Expected: `jira.reporter.ts:8` and `flaky.reporter.ts:1`

- [ ] **Step 2: Update `tests/reporters/jira.reporter.ts`**

Add at top of file:
```typescript
import { Logger } from '../utils/logger';
```

Add private field to `JiraReporter` class (after `private failures`):
```typescript
private readonly logger = new Logger('JiraReporter');
```

Replace each `console.*` call with the equivalent logger call:
- `console.log('\n⚠️  Jira reporter: skipping...')` → `this.logger.warn('Jira reporter: skipping ticket creation (env vars not set)')`
- `console.log(`\n🎫 Creating ...`)` → `this.logger.info(`Creating ${this.failures.length} Jira ticket(s) for failed tests...`)`
- `console.log(` ✅ ${data.key}...`)` → `this.logger.info(`${data.key} — "${test.title}" [${isSmoke ? 'High' : 'Medium'}, ${testType}]`)`
- `console.error(` ❌ Failed to create ticket...`)` → `this.logger.error(`Failed to create ticket for "${test.title}": ${response.status} ${text}`)`
- `console.error(` ❌ Jira API error...`)` → `this.logger.error(`Jira API error for "${test.title}"`, err)`
- `console.log(`    📎 Screenshot attached...`)` → `this.logger.info(`Screenshot attached to ${issueKey}`)`
- `console.error(`    ⚠️  Failed to attach screenshot...`)` → `this.logger.error(`Failed to attach screenshot to ${issueKey}: ${attachResponse.status} ${errorText}`)`
- `console.error(`    ⚠️  Screenshot attachment error...`)` → `this.logger.error(`Screenshot attachment error for ${issueKey}`, err)`

Remove emoji from message strings — the logger format provides structure; emoji belong in human-readable output, not structured logs.

- [ ] **Step 3: Update `tests/reporters/flaky.reporter.ts`**

Add import:
```typescript
import { Logger } from '../utils/logger';
```

Add private field:
```typescript
private readonly logger = new Logger('FlakyReporter');
```

Replace the one `console.error` inside the `if (thresholdExceeded && process.env.CI)` block — keep the guard, only replace the call:
```typescript
this.logger.error(
  `Flaky rate ${(flakyRate * 100).toFixed(1)}% exceeded threshold ${(threshold * 100).toFixed(0)}%. Flaky tests: ${flakyCount}/${totalTests}`
);
```

- [ ] **Step 4: Verify zero console calls remain in reporters**

Run: `grep -c "console\." tests/reporters/jira.reporter.ts tests/reporters/flaky.reporter.ts`
Expected: both lines show `0`

- [ ] **Step 5: Run validate**

Run: `npm run validate`
Expected: all checks pass

- [ ] **Step 6: Commit**

```bash
git add tests/reporters/jira.reporter.ts tests/reporters/flaky.reporter.ts
git commit -m "refactor: replace console.* in reporters with structured Logger"
```
