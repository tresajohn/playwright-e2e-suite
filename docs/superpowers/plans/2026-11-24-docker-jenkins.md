# Docker + Jenkinsfile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `Dockerfile`, `docker-compose.yml`, and `Jenkinsfile` so the suite can run containerised in any CI environment with no host-level Node/browser setup.

**Architecture:** Three independent infrastructure files at the repo root. `Dockerfile` builds the image; `docker-compose.yml` provides named run targets (smoke, regression, 4 shards); `Jenkinsfile` is a parameterised declarative pipeline that runs in the same Docker image. No application code changes.

**Tech Stack:** Docker (mcr.microsoft.com/playwright:v1.49.1-jammy), Docker Compose v2, Jenkins declarative pipeline (Groovy)

**Spec:** `docs/superpowers/specs/2026-11-24-docker-jenkins-design.md`

## Global Constraints

- Playwright image: `mcr.microsoft.com/playwright:v1.49.1-jammy` — matches `@playwright/test` version in this repo
- `HUSKY=0` must appear in `ENV` block (Dockerfile), `environment` block (docker-compose), and `environment` block (Jenkinsfile)
- No `npm run build` step — TypeScript compiled at runtime by Playwright; use `npm run validate` instead
- Smoke tag: `@smoke`; regression tag: `@regression` (this repo's tags — not `@P0`/`@Smoke`)
- Credentials default via env var fallback: `ADMIN_USERNAME:-Admin`, `ADMIN_PASSWORD:-admin123`
- Volumes: `./test-results:/app/test-results`, `./playwright-report:/app/playwright-report`, `./allure-results:/app/allure-results`

## Review Focus

1. **`HUSKY=0` missing from one of the three files** — git hooks would run inside the container and fail because there is no `.git` directory at the expected path; verify all three files carry the flag. Covered in Task 1 Step 2 and Task 2 Step 2.
2. **Image version mismatch** — using `v1.40.0` (Pramod's version) instead of `v1.49.1` would silently install mismatched browsers and may cause test failures. Covered in Task 1 Step 2 and Task 2 Step 2.
3. **`npm run build` present in Dockerfile** — this project has no build script; the step would fail the image build. Covered in Task 1 Step 2.
4. **Jenkinsfile sharding references undefined variable** — Pramod's pipeline uses `\$SHARD` which is never assigned; our pipeline must use the loop variable `shardIndex`. Covered in Task 2 Step 2.
5. **Allure results not archived** — `allure-results/` is listed in `.gitignore` but must be archived as a Jenkins artifact to be useful downstream; both `test-results/**/*` and `allure-results/**/*` must appear in `archiveArtifacts`. Covered in Task 2 Step 2.

---

### Task 1: Dockerfile + docker-compose.yml

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces: `Dockerfile` image name `playwright-e2e-suite` (referenced in docker-compose `build:` context); service names `smoke`, `regression`, `shard-1` through `shard-4` (documented in comments)

- [ ] **Step 1: Write verification checks (RED)**

```bash
# These greps must all FAIL before the files exist
grep -q 'v1.49.1-jammy' Dockerfile 2>/dev/null && echo "PASS" || echo "FAIL: Dockerfile missing"
grep -q 'smoke' docker-compose.yml 2>/dev/null && echo "PASS" || echo "FAIL: docker-compose missing"
```

Run: `grep -q 'v1.49.1-jammy' Dockerfile 2>/dev/null && echo PASS || echo FAIL`
Expected: `FAIL`

- [ ] **Step 2: Create `Dockerfile`**

```dockerfile
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

ENV CI=true
ENV NODE_ENV=test
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV HUSKY=0

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run validate

RUN mkdir -p /app/test-results /app/playwright-report /app/allure-results

CMD ["npx", "playwright", "test"]
```

- [ ] **Step 3: Create `docker-compose.yml`**

Base service extends pattern; each named service overrides `command` and sets `container_name`.

Services: `playwright-base` (not run directly), `smoke`, `regression`, `shard-1`, `shard-2`, `shard-3`, `shard-4`.

Commands:
- `smoke`: `npx playwright test --grep "@smoke" --project=chromium`
- `regression`: `npx playwright test --grep "@regression"`
- `shard-1` … `shard-4`: `npx playwright test --shard=N/4` where N is 1–4

Environment block (all services inherit from base):
```yaml
environment:
  - CI=true
  - HUSKY=0
  - BASE_URL=${BASE_URL:-https://opensource-demo.orangehrmlive.com}
  - ADMIN_USERNAME=${ADMIN_USERNAME:-Admin}
  - ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
```

Volumes block (base service):
```yaml
volumes:
  - ./test-results:/app/test-results
  - ./playwright-report:/app/playwright-report
  - ./allure-results:/app/allure-results
```

- [ ] **Step 4: Verify Dockerfile directives (GREEN)**

Run:
```bash
grep -q 'v1.49.1-jammy' Dockerfile && echo "image ok" || echo "FAIL: image"
grep -q 'HUSKY=0' Dockerfile && echo "husky ok" || echo "FAIL: husky"
! grep -q 'npm run build' Dockerfile && echo "no build ok" || echo "FAIL: build present"
grep -q 'npm run validate' Dockerfile && echo "validate ok" || echo "FAIL: validate"
```

Expected: all four lines print `ok`

- [ ] **Step 5: Verify docker-compose services**

Run:
```bash
for svc in smoke regression shard-1 shard-2 shard-3 shard-4; do
  grep -q "$svc" docker-compose.yml && echo "$svc ok" || echo "FAIL: $svc missing"
done
grep -q 'HUSKY=0' docker-compose.yml && echo "husky ok" || echo "FAIL: husky"
```

Expected: all seven lines print `ok`

- [ ] **Step 6: Validate docker-compose YAML syntax (if Docker available)**

Run: `docker compose config --quiet 2>&1`
Expected: no output (exit 0); skip step if Docker not installed

- [ ] **Step 7: Commit**

```bash
git add Dockerfile docker-compose.yml
git commit -m "feat: add Dockerfile and docker-compose for containerised test runs"
```

---

### Task 2: Jenkinsfile

**Files:**
- Create: `Jenkinsfile`

**Interfaces:**
- Consumes: image name `mcr.microsoft.com/playwright:v1.49.1-jammy` (same as Task 1 Dockerfile)
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Verify Jenkinsfile is absent (RED)**

Run: `test -f Jenkinsfile && echo "EXISTS" || echo "ABSENT"`
Expected: `ABSENT`

- [ ] **Step 2: Create `Jenkinsfile`**

Declarative pipeline with:

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.49.1-jammy'
            args '-u root:root'
        }
    }

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        HUSKY = '0'
    }

    parameters {
        choice(name: 'TEST_TYPE', choices: ['all', 'smoke', 'regression'],
               description: 'Which tests to run')
        choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'all'],
               description: 'Browser project (used for smoke runs)')
        string(name: 'SHARD_COUNT', defaultValue: '4',
               description: 'Parallel shards for TEST_TYPE=all')
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('Checkout') { steps { checkout scm } }

        stage('Install') { steps { sh 'npm ci' } }

        stage('Validate') { steps { sh 'npm run validate' } }

        stage('Run Tests') {
            steps {
                script {
                    if (params.TEST_TYPE == 'smoke') {
                        def proj = params.BROWSER != 'all' ? "--project=${params.BROWSER}" : ''
                        sh "npx playwright test --grep '@smoke' ${proj}"
                    } else if (params.TEST_TYPE == 'regression') {
                        sh "npx playwright test --grep '@regression'"
                    } else {
                        def count = params.SHARD_COUNT.toInteger()
                        def shards = [:]
                        for (int i = 1; i <= count; i++) {
                            def shardIndex = i
                            shards["Shard ${shardIndex}/${count}"] = {
                                sh "npx playwright test --shard=${shardIndex}/${count}"
                            }
                        }
                        parallel shards
                    }
                }
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : 'playwright-report',
                reportFiles          : 'index.html',
                reportName           : 'Playwright Report'
            ])
            archiveArtifacts artifacts: 'test-results/**/*',  allowEmptyArchive: true
            archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true
            cleanWs()
        }
        success { echo '✅ All tests passed' }
        failure { echo '❌ Tests failed — check the Playwright Report above' }
    }
}
```

- [ ] **Step 3: Verify Jenkinsfile key elements**

Run:
```bash
grep -q 'v1.49.1-jammy' Jenkinsfile          && echo "image ok"      || echo "FAIL: image"
grep -q "HUSKY = '0'"   Jenkinsfile          && echo "husky ok"      || echo "FAIL: husky"
grep -q 'shardIndex'    Jenkinsfile          && echo "shardIndex ok" || echo "FAIL: undefined \$SHARD"
grep -q "allure-results" Jenkinsfile         && echo "allure ok"     || echo "FAIL: allure not archived"
grep -q 'npm run validate' Jenkinsfile       && echo "validate ok"   || echo "FAIL: validate stage"
grep -q "TEST_TYPE"     Jenkinsfile          && echo "params ok"     || echo "FAIL: parameters"
```

Expected: all six lines print `ok`

- [ ] **Step 4: Commit**

```bash
git add Jenkinsfile
git commit -m "feat: add parameterised Jenkinsfile with Docker agent and shard support"
```
