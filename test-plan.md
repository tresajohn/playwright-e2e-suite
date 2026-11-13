# Test Plan — OrangeHRM Playwright E2E Suite

**Project:** playwright-e2e-suite  
**Application Under Test:** OrangeHRM Demo — https://opensource-demo.orangehrmlive.com  
**Author:** Tresa John · QA Lead  
**Version:** 1.0  
**Date:** 2026-11-12  
**Generated using:** Test Case Generator skill (`/Test_Case_Generator`)

---

## 1. Document Purpose

This test plan defines the scope, strategy, techniques, environment, and exit criteria for the automated and manual testing of the OrangeHRM HR Management System. It covers six functional modules — Authentication, Dashboard, PIM / Employee Management, Leave Management, Recruitment, and REST API — across three test layers: Page Object Model (POM), BDD (Gherkin/playwright-bdd), and API.

The test cases detailed in [docs/test-cases.md](./test-cases.md) are derived from this plan. This document is the governing strategy; test-cases.md is the execution artefact.

---

## 2. Scope

### In Scope

| Module | UI (POM) | BDD | API |
|--------|----------|-----|-----|
| Authentication — Login / Logout | ✅ | ✅ | — |
| Dashboard — Navigation | ✅ | — | — |
| PIM — Employee List, Add Employee, Search | ✅ | ✅ | ✅ |
| Leave — Leave List, Apply Leave, Entitlements | ✅ | ✅ | ✅ |
| Recruitment — Vacancies, Add Vacancy, Candidates | ✅ | ✅ | — |
| API — Auth session, Employees, Leave Types | — | — | ✅ |

### Out of Scope

- Performance / load testing (beyond the single response-time API test)
- Mobile browsers
- Admin configuration (system settings, job categories, pay grades)
- Payroll and reporting modules
- Database-layer testing
- Third-party integrations (LinkedIn, email providers)

---

## 3. Test Objectives

1. Verify all acceptance criteria for the six in-scope modules.
2. Achieve ≥ 95% automation coverage of functional test cases.
3. Detect regressions within the CI pipeline on every push to `main`.
4. Validate REST API contracts — status codes, response schemas, and pagination behaviour.
5. Surface test failures as Jira tickets automatically, with zero manual triage steps required.
6. Maintain a live traceability matrix linking every test case to an acceptance criterion.

---

## 4. Test Approach

### 4.1 Techniques Applied

The Test Case Generator skill applies the following systematic techniques to every module:

| Technique | Application |
|-----------|-------------|
| **Equivalence Partitioning** | Each input grouped into valid, invalid, boundary, empty/null, and special-character classes |
| **Boundary Value Analysis** | Tests at min, min−1, max, and max+1 for field length and numeric parameters |
| **Positive / Negative pairing** | Every happy-path test has at least one corresponding failure scenario |
| **Risk-based prioritisation** | P0–P3 assigned using the formula: `(Business Impact × 0.5) + (Failure Likelihood × 0.3) + (Complexity × 0.2)` |
| **Implicit requirement coverage** | Security (XSS, SQL injection), performance (response time), and cross-browser included beyond stated criteria |

### 4.2 Risk Priority Formula

```
Priority Score = (Business Impact × 0.5) + (Failure Likelihood × 0.3) + (Complexity × 0.2)

Score > 0.7  →  P0  Smoke / critical path — must pass before any release
Score 0.5–0.7→  P1  Core functionality — blocks sprint sign-off
Score 0.3–0.5→  P2  Standard regression
Score < 0.3  →  P3  Edge case / cosmetic
```

Each factor rated 0–1:
- **Business Impact** — Would failure block a user from their core workflow?
- **Failure Likelihood** — Is this area historically buggy or recently changed?
- **Complexity** — Number of conditions, integrations, or data combinations.

### 4.3 Test Layers

**Layer 1 — POM E2E (Playwright + TypeScript)**  
Tests mirror real user journeys. Each page has a corresponding Page Object class (`tests/pages/`) encapsulating selectors and actions. Shared auth state (`playwright/.auth/admin.json`) is reused across tests to avoid re-login overhead.

**Layer 2 — BDD (Gherkin + playwright-bdd v8)**  
Feature files in `features/` define behaviour in plain English. Step definitions (`steps/`) inject Page Object fixtures. P0 and P1 test cases are mapped to Gherkin scenarios. BDD tests run as a separate `bdd-chromium` Playwright project.

**Layer 3 — API (Playwright APIRequestContext)**  
A typed API client (`tests/e2e/api/orangehrm-api.client.ts`) wraps the OrangeHRM REST API v2. Tests assert status codes, response schemas, pagination, and authenticated access. API tests carry the same auth cookies as UI tests via a shared `storageState`.

**Manual only** — Security tests (XSS, SQL injection) are executed manually per release; not included in the automated suite to avoid false positives on the public demo environment.

---

## 5. Test Environment

| Item | Detail |
|------|--------|
| Application | OrangeHRM Demo — `https://opensource-demo.orangehrmlive.com` |
| Test user | `Admin` / `admin123` |
| Primary browser | Chromium (all CI jobs) |
| Secondary browser | Firefox (cross-browser project, local only) |
| OS — local | macOS 12 (Monterey) |
| OS — CI | Ubuntu Latest (GitHub Actions) |
| Node version | 20.x |
| Playwright version | 1.49.1 (pinned — macOS 12 compatibility) |
| playwright-bdd | 8.5.1 |
| Allure | allure-playwright 2.15.1 |
| CI/CD | GitHub Actions |
| Defect tracking | Jira (project: KAN — tresajohn.atlassian.net) |
| Report hosting | GitHub Pages — https://tresajohn.github.io/playwright-e2e-suite |

---

## 6. Entry and Exit Criteria

### Entry Criteria

- [ ] OrangeHRM demo application is accessible and login succeeds with Admin credentials
- [ ] All Playwright browsers installed (`npx playwright install chromium`)
- [ ] Auth state file generated (`playwright/.auth/admin.json` exists)
- [ ] All npm dependencies installed (`npm ci`)
- [ ] Environment variables set (`.env` or GitHub Secrets)

### Exit Criteria

- [ ] All P0 tests pass (0 failures permitted)
- [ ] P1 failure rate ≤ 2% (at most 1 failure per 50 P1 tests)
- [ ] No unresolved P0 or P1 Jira tickets from the current run
- [ ] Allure report published to GitHub Pages
- [ ] Traceability matrix updated to reflect any new or removed tests

### Suspension Criteria

Testing is suspended if:
- OrangeHRM demo becomes unreachable for more than 30 minutes
- More than 25% of P0 smoke tests fail (indicating environment instability, not code defects)

---

## 7. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OrangeHRM public demo instability / data changes | High | High | Retries configured (`retries: 2` in CI); tests assert behaviour not specific data values where possible |
| Auth session expiry between test runs | Medium | High | `auth.setup.ts` runs first on every CI job to refresh `admin.json` |
| Browser API changes breaking selectors | Low | Medium | `getByRole` / `getByLabel` preferred over CSS — resilient to DOM restructures |
| Jira API token expiry breaking reporter | Medium | Low | Reporter silently skips if env vars missing; core tests unaffected |
| allure-playwright version incompatibility | Low | Low | Pinned to 2.15.1; upgrade gated behind Playwright version bump |
| Public demo receives new UI version mid-sprint | Medium | High | Smoke test alert via Jira ticket; manual triage before regression run proceeds |

---

## 8. Acceptance Criteria Breakdown by Module

### Module 1 — Authentication

**User story:** As an admin, I want to log in with my credentials so I can access the HRM system securely.

| # | Acceptance Criterion | Priority |
|---|---------------------|----------|
| AC-AUTH-1 | Valid credentials redirect to the dashboard | P0 |
| AC-AUTH-2 | Invalid credentials display an error message | P0 |
| AC-AUTH-3 | Empty form submission shows required field validation | P1 |
| AC-AUTH-4 | Password field masks input characters | P1 |
| AC-AUTH-5 | Forgot password link navigates to the reset page | P2 |
| AC-AUTH-6 | Logout redirects the user back to the login page | P0 |
| AC-AUTH-7 | User can re-login successfully after a failed attempt | P2 |

**Equivalence Classes:**

| Parameter | Valid | Invalid | Boundary | Special |
|-----------|-------|---------|----------|---------|
| Username | `Admin` | `wronguser` | 1 char / 255 chars | `<script>alert(1)</script>` |
| Password | `admin123` | `wrongpass` | 1 char / 255 chars | `' OR '1'='1` |
| Both fields | Valid pair | Invalid pair | Both empty | — |

---

### Module 2 — Dashboard

**User story:** As an admin, I want to see the dashboard after login so I can navigate to all HRM modules.

| # | Acceptance Criterion | Priority |
|---|---------------------|----------|
| AC-DASH-1 | Dashboard heading is visible after login | P0 |
| AC-DASH-2 | All main navigation menu items are present | P1 |
| AC-DASH-3 | Quick launch widgets are displayed | P2 |
| AC-DASH-4 | Admin can navigate to PIM module from dashboard | P1 |

---

### Module 3 — PIM / Employee Management

**User story:** As an admin, I want to manage employee records so I can add, search, and maintain staff data.

| # | Acceptance Criterion | Priority |
|---|---------------------|----------|
| AC-PIM-1 | Employee list page shows all employees in a table | P0 |
| AC-PIM-2 | Admin can search for an employee by name | P1 |
| AC-PIM-3 | Search with unknown name shows "No Records Found" | P1 |
| AC-PIM-4 | Reset button clears search filters | P2 |
| AC-PIM-5 | Add button navigates to the Add Employee form | P0 |
| AC-PIM-6 | Add Employee form accepts first, middle, and last name | P0 |
| AC-PIM-7 | Saving a valid employee record navigates to the employee profile | P0 |
| AC-PIM-8 | Submitting the form without required fields shows validation errors | P1 |
| AC-PIM-9 | GET /pim/employees returns 200 with a data array | P0 |
| AC-PIM-10 | Employee response schema contains empNumber, firstName, lastName, employeeId | P1 |
| AC-PIM-11 | Pagination limit and offset parameters function correctly | P1 |
| AC-PIM-12 | GET /pim/employees/{id} returns 200 for existing employee | P0 |
| AC-PIM-13 | GET /pim/employees/{id} returns 422 for non-existent employee | P1 |

**Equivalence Classes:**

| Parameter | Valid | Invalid | Boundary |
|-----------|-------|---------|----------|
| First Name | `Tresa` | (empty) | 1 char / 50 chars |
| Last Name | `John` | (empty) | 1 char / 50 chars |
| Search Name | Existing name | Unknown name | Empty string |
| API limit | `10` | `-1` | `0` / `50` |
| API offset | `0` | `-1` | `0` / total count |
| Employee ID | Valid int | Non-existent int | `0` / max int |

---

### Module 4 — Leave Management

**User story:** As an admin, I want to manage employee leave so I can view, apply, and track leave requests.

| # | Acceptance Criterion | Priority |
|---|---------------------|----------|
| AC-LVE-1 | Leave list page shows leave records in a table | P0 |
| AC-LVE-2 | Table displays Leave Type and Status columns | P1 |
| AC-LVE-3 | Admin can navigate to Apply Leave page | P1 |
| AC-LVE-4 | Apply Leave page shows the leave type dropdown | P1 |
| AC-LVE-5 | Admin can navigate to My Leave List | P2 |
| AC-LVE-6 | Admin can navigate to Leave Entitlements page | P2 |
| AC-LVE-7 | GET /leave/leave-types returns 200 with a data array | P0 |
| AC-LVE-8 | Leave type response schema contains id, name, deleted | P1 |
| AC-LVE-9 | Only active leave types returned (deleted = false) | P1 |
| AC-LVE-10 | meta.total matches the actual data array length | P2 |

**Equivalence Classes:**

| Parameter | Valid | Invalid | Boundary |
|-----------|-------|---------|----------|
| Leave type selection | Existing type name | No selection | — |
| Leave type `deleted` | `false` | `true` | — |

---

### Module 5 — Recruitment

**User story:** As an admin, I want to manage job vacancies and candidates so I can track the recruitment pipeline.

| # | Acceptance Criterion | Priority |
|---|---------------------|----------|
| AC-REC-1 | Job Vacancies page loads with correct URL | P0 |
| AC-REC-2 | Add button is visible on the vacancies page | P0 |
| AC-REC-3 | Clicking Add navigates to the Add Vacancy form | P0 |
| AC-REC-4 | Add Vacancy form contains job title dropdown and vacancy name input | P1 |
| AC-REC-5 | Submitting the form without required fields shows validation errors | P1 |
| AC-REC-6 | Admin can search vacancies by job title | P1 |
| AC-REC-7 | Admin can navigate to the Candidates page | P1 |

**Equivalence Classes:**

| Parameter | Valid | Invalid | Boundary |
|-----------|-------|---------|----------|
| Vacancy Name | Any non-empty string | (empty) | 1 char / 100 chars |
| Job Title | Existing dropdown option | No selection | — |
| Search term | Partial / full job title | Unknown title | Empty string |

---

## 9. Gherkin Scenarios — P0 / P1 Test Cases

The following scenarios are implemented in `features/` and executed by the `bdd-chromium` project.

```gherkin
# features/auth/login.feature

@smoke @auth @bdd
Feature: User Authentication

  @P0
  Scenario: Successful login with valid admin credentials
    Given the user is on the login page
    When  the user enters username "Admin" and password "admin123"
    And   clicks the Login button
    Then  the page URL contains "/dashboard"
    And   the heading "Dashboard" is visible

  @P0
  Scenario: Logout redirects back to login page
    Given the user is logged in as admin
    When  the user clicks the user menu
    And   selects "Logout"
    Then  the page URL contains "/auth/login"
    And   the login form is visible

  @P1
  Scenario Outline: Invalid credentials show error message
    Given the user is on the login page
    When  the user enters username "<username>" and password "<password>"
    And   clicks the Login button
    Then  the error message "Invalid credentials" is visible

    Examples:
      | username     | password     |
      | wronguser    | admin123     |
      | Admin        | wrongpass    |
      | wronguser    | wrongpass    |

  @P1
  Scenario: Empty form submission shows required field validation
    Given the user is on the login page
    When  the user clicks the Login button without entering credentials
    Then  required field validation errors are shown


# features/pim/employee.feature

@regression @pim @bdd
Feature: Employee Management (PIM)

  @P0
  Scenario: Employee list page loads with data table
    Given the admin is logged in
    When  the admin navigates to the Employee List page
    Then  the heading "Employee Information" is visible
    And   the employee data table is displayed

  @P0
  Scenario: Navigate to Add Employee page
    Given the admin is on the Employee List page
    When  the admin clicks the "Add" button
    Then  the heading "Add Employee" is visible

  @P1
  Scenario: Search with unknown name shows no records
    Given the admin is on the Employee List page
    When  the admin searches for "ZZZNonExistentEmployee999"
    And   clicks Search
    Then  the message "No Records Found" is visible


# features/leave/leave.feature

@regression @leave @bdd
Feature: Leave Management

  @P0
  Scenario: Leave list page loads with table
    Given the admin is logged in
    When  the admin navigates to Leave List
    Then  the leave data table is visible

  @P1
  Scenario: Navigate to Apply Leave page shows leave type dropdown
    Given the admin is on the Leave List page
    When  the admin navigates to Apply Leave
    Then  the leave type dropdown is visible


# features/recruitment/recruitment.feature

@regression @recruitment @bdd
Feature: Recruitment Management

  @P0
  Scenario: Job Vacancies page loads
    Given the admin is logged in
    When  the admin navigates to Recruitment > Vacancies
    Then  the "Add" button is visible

  @P0
  Scenario: Navigate to Add Vacancy form
    Given the admin is on the Vacancies page
    When  the admin clicks "Add"
    Then  the job title dropdown is visible
    And   the vacancy name input is visible
```

---

## 10. Playwright Spec Mapping

| TC ID | Playwright Spec | Test Name | Project | Status |
|-------|----------------|-----------|---------|--------|
| TC-AUTH-001 | `tests/e2e/auth/login.spec.ts` | should login successfully with valid admin credentials | chromium, firefox | ✅ Automated |
| TC-AUTH-002 | `tests/e2e/auth/login.spec.ts` | should show error for invalid credentials | chromium, firefox | ✅ Automated |
| TC-AUTH-003 | `tests/e2e/auth/login.spec.ts` | should show error for wrong password | chromium | ✅ Automated |
| TC-AUTH-004 | `tests/e2e/auth/login.spec.ts` | should show required field errors for empty form | chromium | ✅ Automated |
| TC-AUTH-005 | `tests/e2e/auth/login.spec.ts` | should mask password input | chromium | ✅ Automated |
| TC-AUTH-006 | `tests/e2e/auth/login.spec.ts` | should navigate to forgot password page | chromium | ✅ Automated |
| TC-AUTH-007 | `tests/e2e/auth/login.spec.ts` | should logout successfully and redirect to login | chromium | ✅ Automated |
| TC-AUTH-008 | `tests/e2e/auth/login.spec.ts` | should allow re-login after failed attempt | chromium | ✅ Automated |
| TC-AUTH-009–012 | `features/auth/login.feature` | (see Gherkin scenarios above) | bdd-chromium | ✅ Automated |
| TC-AUTH-013 | — | XSS in username field | — | ❌ Manual |
| TC-AUTH-014 | — | SQL injection in password field | — | ❌ Manual |
| TC-AUTH-015 | `tests/e2e/auth/login.spec.ts` | (all login tests) | firefox | ✅ Automated |
| TC-DASH-001–007 | `tests/e2e/dashboard/dashboard.spec.ts` | should load dashboard / should display all main navigation… | chromium | ✅ Automated |
| TC-PIM-001–008 | `tests/e2e/pim/employee.spec.ts` | should display employee list… | chromium | ✅ Automated |
| TC-PIM-009–015 | `features/pim/employee.feature` | (see Gherkin scenarios above) | bdd-chromium | ✅ Automated |
| TC-PIM-016–022 | `tests/e2e/api/employees.api.spec.ts` | GET /pim/employees… | api | ✅ Automated |
| TC-LVE-001–007 | `tests/e2e/leave/leave.spec.ts` | should display leave list page… | chromium | ✅ Automated |
| TC-LVE-008–013 | `features/leave/leave.feature` | (see Gherkin scenarios above) | bdd-chromium | ✅ Automated |
| TC-LVE-014–017 | `tests/e2e/api/leave.api.spec.ts` | GET /leave/leave-types… | api | ✅ Automated |
| TC-REC-001–009 | `tests/e2e/recruitment/recruitment.spec.ts` | should display job vacancies page… | chromium | ✅ Automated |
| TC-REC-010–016 | `features/recruitment/recruitment.feature` | (see Gherkin scenarios above) | bdd-chromium | ✅ Automated |
| TC-API-001–004 | `tests/e2e/api/auth.api.spec.ts` | authenticated session can access… | api | ✅ Automated |

---

## 11. Full Traceability Matrix

| TC ID | Acceptance Criterion | Playwright Spec | Priority | Status |
|-------|---------------------|-----------------|----------|--------|
| TC-AUTH-001 | AC-AUTH-1 Valid credentials redirect to dashboard | `login.spec.ts` | P0 | ✅ |
| TC-AUTH-002 | AC-AUTH-2 Invalid credentials show error | `login.spec.ts` | P0 | ✅ |
| TC-AUTH-003 | AC-AUTH-2 Wrong password shows error | `login.spec.ts` | P0 | ✅ |
| TC-AUTH-004 | AC-AUTH-3 Empty form shows validation | `login.spec.ts` | P1 | ✅ |
| TC-AUTH-005 | AC-AUTH-4 Password field masks input | `login.spec.ts` | P1 | ✅ |
| TC-AUTH-006 | AC-AUTH-5 Forgot password link works | `login.spec.ts` | P2 | ✅ |
| TC-AUTH-007 | AC-AUTH-6 Logout redirects to login | `login.spec.ts` | P0 | ✅ |
| TC-AUTH-008 | AC-AUTH-7 Re-login after failure works | `login.spec.ts` | P2 | ✅ |
| TC-AUTH-009–012 | AC-AUTH-1,2,3,6 (BDD) | `login.feature` | P0/P1 | ✅ |
| TC-AUTH-013 | AC-AUTH-2 XSS in username | Manual | P1 | ❌ |
| TC-AUTH-014 | AC-AUTH-2 SQL injection | Manual | P1 | ❌ |
| TC-AUTH-015 | AC-AUTH-1 Cross-browser Firefox | `login.spec.ts` | P2 | ✅ |
| TC-DASH-001 | AC-DASH-1 Dashboard heading visible | `dashboard.spec.ts` | P0 | ✅ |
| TC-DASH-002–005 | AC-DASH-2 Navigation items visible | `dashboard.spec.ts` | P1 | ✅ |
| TC-DASH-006 | AC-DASH-4 Navigate to PIM | `dashboard.spec.ts` | P1 | ✅ |
| TC-DASH-007 | AC-DASH-3 Widgets displayed | `dashboard.spec.ts` | P2 | ✅ |
| TC-PIM-001 | AC-PIM-1 Employee list visible | `employee.spec.ts` | P0 | ✅ |
| TC-PIM-002 | AC-PIM-2 Search by name returns results | `employee.spec.ts` | P1 | ✅ |
| TC-PIM-003 | AC-PIM-3 No records for unknown name | `employee.spec.ts` | P1 | ✅ |
| TC-PIM-004 | AC-PIM-4 Reset clears filters | `employee.spec.ts` | P2 | ✅ |
| TC-PIM-005 | AC-PIM-5 Add button navigates to form | `employee.spec.ts` | P0 | ✅ |
| TC-PIM-006 | AC-PIM-6,7 Save valid employee | `employee.spec.ts` | P0 | ✅ |
| TC-PIM-007 | AC-PIM-8 Validation on empty form | `employee.spec.ts` | P1 | ✅ |
| TC-PIM-008 | AC-PIM-6 Employee ID field visible | `employee.spec.ts` | P2 | ✅ |
| TC-PIM-009–015 | AC-PIM-1,2,3,4,5,7,8 (BDD) | `employee.feature` | P0/P1/P2 | ✅ |
| TC-PIM-016 | AC-PIM-9 API 200 with data array | `employees.api.spec.ts` | P0 | ✅ |
| TC-PIM-017 | AC-PIM-10 Schema validation | `employees.api.spec.ts` | P1 | ✅ |
| TC-PIM-018 | AC-PIM-11 Limit pagination | `employees.api.spec.ts` | P1 | ✅ |
| TC-PIM-019 | AC-PIM-11 Offset pagination | `employees.api.spec.ts` | P2 | ✅ |
| TC-PIM-020 | AC-PIM-12 GET by valid ID | `employees.api.spec.ts` | P0 | ✅ |
| TC-PIM-021 | AC-PIM-13 GET by non-existent ID → 422 | `employees.api.spec.ts` | P1 | ✅ |
| TC-PIM-022 | AC-PIM-9 Content-Type JSON | `employees.api.spec.ts` | P2 | ✅ |
| TC-LVE-001 | AC-LVE-1 Leave list loads | `leave.spec.ts` | P0 | ✅ |
| TC-LVE-002 | AC-LVE-2 Leave Type column | `leave.spec.ts` | P1 | ✅ |
| TC-LVE-003 | AC-LVE-2 Status column | `leave.spec.ts` | P1 | ✅ |
| TC-LVE-004 | AC-LVE-3 Navigate to Apply Leave | `leave.spec.ts` | P1 | ✅ |
| TC-LVE-005 | AC-LVE-4 Leave type dropdown | `leave.spec.ts` | P1 | ✅ |
| TC-LVE-006 | AC-LVE-5 Navigate to My Leave List | `leave.spec.ts` | P2 | ✅ |
| TC-LVE-007 | AC-LVE-6 Navigate to Entitlements | `leave.spec.ts` | P2 | ✅ |
| TC-LVE-008–013 | AC-LVE-1,2,3,4,5 (BDD) | `leave.feature` | P0/P1/P2 | ✅ |
| TC-LVE-014 | AC-LVE-7 API 200 with data array | `leave.api.spec.ts` | P0 | ✅ |
| TC-LVE-015 | AC-LVE-8 Schema validation | `leave.api.spec.ts` | P1 | ✅ |
| TC-LVE-016 | AC-LVE-9 Only active types returned | `leave.api.spec.ts` | P1 | ✅ |
| TC-LVE-017 | AC-LVE-10 meta.total matches data count | `leave.api.spec.ts` | P2 | ✅ |
| TC-REC-001 | AC-REC-1 Vacancies page loads | `recruitment.spec.ts` | P0 | ✅ |
| TC-REC-002 | AC-REC-2 Add button visible | `recruitment.spec.ts` | P0 | ✅ |
| TC-REC-003 | AC-REC-3 Add navigates to form | `recruitment.spec.ts` | P0 | ✅ |
| TC-REC-004 | AC-REC-4 Job title dropdown | `recruitment.spec.ts` | P1 | ✅ |
| TC-REC-005 | AC-REC-4 Vacancy name input | `recruitment.spec.ts` | P1 | ✅ |
| TC-REC-006 | AC-REC-5 Validation on empty form | `recruitment.spec.ts` | P1 | ✅ |
| TC-REC-007 | AC-REC-6 Search by job title | `recruitment.spec.ts` | P1 | ✅ |
| TC-REC-008 | AC-REC-7 Navigate to Candidates | `recruitment.spec.ts` | P1 | ✅ |
| TC-REC-009 | AC-REC-7 Candidates page loads | `recruitment.spec.ts` | P2 | ✅ |
| TC-REC-010–016 | AC-REC-1,2,3,4,5,6,7 (BDD) | `recruitment.feature` | P0/P1 | ✅ |
| TC-API-001 | AC-PIM-9 Auth session → employees | `auth.api.spec.ts` | P0 | ✅ |
| TC-API-002 | AC-REC-1 Auth session → vacancies | `auth.api.spec.ts` | P1 | ✅ |
| TC-API-003 | AC-LVE-7 Auth session → leave types | `auth.api.spec.ts` | P1 | ✅ |
| TC-API-004 | Performance — response < 5s | `auth.api.spec.ts` | P2 | ✅ |

---

## 12. Coverage Summary

| Module | Total TCs | P0 | P1 | P2 | Automated | Manual |
|--------|-----------|----|----|----|-----------|----|
| Authentication | 15 | 4 | 6 | 4 | 13 | 2 |
| Dashboard | 7 | 1 | 4 | 2 | 7 | 0 |
| PIM / Employee | 22 | 7 | 9 | 5 | 22 | 0 |
| Leave | 17 | 3 | 8 | 5 | 17 | 0 |
| Recruitment | 16 | 4 | 8 | 3 | 16 | 0 |
| API | 4 | 1 | 2 | 1 | 4 | 0 |
| **Total** | **81** | **20** | **37** | **20** | **79** | **2** |

**Automation coverage: 97.5%**

Not automated: TC-AUTH-013 (XSS) and TC-AUTH-014 (SQL injection) — executed manually per release cycle.

| Test Type | Count |
|-----------|-------|
| Functional (POM) | 32 |
| Negative | 10 |
| BDD (Gherkin) | 27 |
| API | 11 |
| Cross-browser | 1 |
| Security (manual) | 2 |
| **Total** | **83** |

---

## 13. Test Deliverables

| Deliverable | Location | Updated |
|-------------|----------|---------|
| This test plan | `docs/test-plan.md` | Each sprint |
| Detailed test cases | `docs/test-cases.md` | Each sprint |
| POM spec files | `tests/e2e/**/*.spec.ts` | Per feature |
| BDD feature files | `features/**/*.feature` | Per story |
| API spec files | `tests/e2e/api/*.api.spec.ts` | Per endpoint |
| Allure HTML reports | GitHub Actions artifacts (14-day retention) | Per CI run |
| Combined Allure report | https://tresajohn.github.io/playwright-e2e-suite | Per push to main |
| Jira bug tickets | KAN board (tresajohn.atlassian.net) | Auto-created on failure |
| CI pipeline | `.github/workflows/playwright.yml` | Per pipeline change |

---

## 14. References

- [Playwright Docs](https://playwright.dev)
- [playwright-bdd v8](https://vitalets.github.io/playwright-bdd)
- [OrangeHRM Demo](https://opensource-demo.orangehrmlive.com)
- [Jira KAN Board](https://tresajohn.atlassian.net/jira/software/projects/KAN/boards)
- [GitHub Actions Runs](https://github.com/tresajohn/playwright-e2e-suite/actions)
- [Allure Report](https://tresajohn.github.io/playwright-e2e-suite)
- Skill: `Test_Case_Generator` — applied to derive all test cases, equivalence partitions, and traceability matrix in this document

---

*This document is version-controlled in the repository. Update when: acceptance criteria change, new modules are added, automation status changes, or exit criteria are revised.*
