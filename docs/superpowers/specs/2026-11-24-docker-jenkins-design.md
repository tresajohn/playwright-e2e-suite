# Docker + Jenkinsfile Design

**Intent:** Containerise the Playwright E2E suite and add a Jenkins pipeline so the tests can run in any CI environment with no host-level Node/browser setup.

**Why:** Portfolio completeness — shows ability to ship a framework that runs in Docker and integrates with enterprise CI (Jenkins), matching the reference repo (PramodDutta/Advance-Playwright-Framework).

## Goals
- `Dockerfile` builds a runnable image; `docker run` executes all tests
- `docker-compose.yml` provides named services: smoke, regression, 4 shards
- `Jenkinsfile` parameterised pipeline: TEST_TYPE, BROWSER, shard count
- Jenkins pipeline publishes HTML report and archives allure-results + test-results
- `HUSKY=0` set everywhere containers/CI run so git hooks are skipped

## Non-goals
- Not wiring up a real Jenkins instance — the files are the deliverable
- Not changing any test code or page objects
- Not adding Docker layer caching beyond standard `COPY package*.json` ordering

## Anti-goals
- Do not pin to Pramod's outdated `v1.40.0` image — use `v1.49.1-jammy` to match this repo's `@playwright/test` version
- Do not add `npm run build` — this project compiles TypeScript at runtime via Playwright; a separate build step does not exist and would fail

## Constraints
- Playwright image: `mcr.microsoft.com/playwright:v1.49.1-jammy`
- Credentials: `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars; defaults to `Admin` / `admin123` (public OrangeHRM demo site) — no secrets required for a basic run
- `HUSKY=0` must be set in `ENV` (Dockerfile), `environment` (docker-compose), and `environment` (Jenkinsfile)
- Must pass `npm run validate` (typecheck + lint + prettier) — added as a Dockerfile `RUN` step and a Jenkins stage
- Tags in this repo: `@smoke`, `@regression` — not `@P0`/`@Smoke` as in Pramod's repo

## Approaches considered
1. **Match Pramod's structure exactly** — 3 files, same shape, adapt tags/version: chosen. Reviewers recognise the pattern and see the adaptations.
2. **Leaner (no docker-compose)** — Dockerfile + Jenkinsfile only; compose is nice-to-have. Dropped: compose shows Docker knowledge and matches the reference repo.

## Files
- **Create:** `Dockerfile`
- **Create:** `docker-compose.yml`
- **Create:** `Jenkinsfile`

## Jenkinsfile design decisions (builder's reference)
- Agent: `docker { image 'mcr.microsoft.com/playwright:v1.49.1-jammy'; args '-u root:root' }`
- Parameters: `TEST_TYPE` (smoke/regression/all), `BROWSER` (chromium/firefox/all), `SHARD_COUNT` (default 4)
- Sharding: use Jenkins `parallel` map with entries `"Shard ${i}/${count}"` — fixes Pramod's broken `\$SHARD` variable
- Smoke grep: `--grep "@smoke"` (this repo's tag)
- Regression grep: `--grep "@regression"`
- Post always: `publishHTML` for playwright-report, `archiveArtifacts` for `test-results/**/*` and `allure-results/**/*`, `cleanWs()`
- No `npm run build` stage — replaced by `npm run validate`
