# Structured Logger Design

**Intent:** Replace ad-hoc `console.*` calls in reporters with a scoped, level-filtered logger that outputs human-readable text locally and machine-parseable JSON in CI.

**Why:** Raw `console.log` has no level, no context tag, no timestamp, and no CI-friendly format. A structured logger makes reporter output greppable in CI logs and readable locally without changing any test behaviour.

## Goals
- Zero new runtime dependencies
- Context tag per instantiation (`new Logger('JiraReporter')`)
- Four levels: DEBUG, INFO, WARN, ERROR — global level filter, default INFO
- Local output: `[ISO-timestamp] [LEVEL] [context] message`
- CI output (`CI=true`): `{"ts":"...","level":"INFO","ctx":"...","msg":"...","error":"..."}` (NDJSON)
- `.step()`, `.testStart()`, `.testEnd()` helpers matching Pramod's shape

## Non-goals
- Not a Playwright reporter — does not emit to test results or trace
- Does not replace the formatted `console.log` output in `tests/ai-validation/index.ts`

## Constraints
- Must pass `npm run validate` (typecheck + lint + prettier)
- Matches Pramod's `Logger` class shape so the pattern is recognisable

## Approaches considered
1. **Third-party (winston / pino / tslog):** full features, real dependency, overkill for 9 call sites
2. **Thin custom wrapper — chosen:** matches Pramod's pattern, zero deps, CI output added as ~5-line extension

## Files
- **Create:** `tests/utils/logger.ts` — `LogLevel` enum + `Logger` class
- **Modify:** `tests/utils/index.ts` — add `Logger` and `LogLevel` to barrel export
- **Modify:** `tests/reporters/jira.reporter.ts` — replace 8 `console.*` calls with scoped logger
- **Modify:** `tests/reporters/flaky.reporter.ts` — replace 1 `console.error` call with scoped logger

## Builder's calls
- `error(message, error?)` accepts an optional unknown second arg (matches Pramod's signature)
- `shouldLog` compares ordinal position in the enum array — same as Pramod
- JSON output key names: `ts`, `level`, `ctx`, `msg`, `error` (optional)
