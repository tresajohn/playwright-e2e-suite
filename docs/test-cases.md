# OrangeHRM Test Cases

Generated from acceptance criteria for all automated modules. Each test case maps to a Playwright spec and Gherkin scenario where applicable.

**Modules:** Authentication · Dashboard · PIM / Employee · Leave · Recruitment · API

---

## Module 1 — Authentication

**User Story:** As an admin, I want to log in with my credentials so I can access the HRM system securely.

### Acceptance Criteria
1. Valid credentials redirect to the dashboard
2. Invalid credentials display an error message
3. Empty form submission shows required field validation
4. Password field masks input characters
5. Forgot password link navigates to the reset page
6. Logout redirects the user back to the login page
7. User can re-login successfully after a failed attempt

### Equivalence Classes

| Parameter | Valid | Invalid | Boundary / Special |
|-----------|-------|---------|-------------------|
| Username | `Admin` | `wronguser` | Empty, 1 char, spaces, `<script>` |
| Password | `admin123` | `wrongpass` | Empty, 1 char, spaces, `' OR 1=1` |
| Both fields | Valid pair | Invalid pair | Both empty |

### Test Cases

| TC ID | Title | Preconditions | Expected Result | Priority | Type | Automated |
|-------|-------|---------------|-----------------|----------|------|-----------|
| TC-AUTH-001 | Login with valid admin credentials | On /auth/login, logged out | Redirected to /dashboard, heading "Dashboard" visible | P0 | Functional | ✅ `login.spec.ts` |
| TC-AUTH-002 | Login with invalid username and password | On /auth/login | Error message "Invalid credentials" shown | P0 | Negative | ✅ `login.spec.ts` |
| TC-AUTH-003 | Login with valid username, wrong password | On /auth/login | Error message "Invalid credentials" shown | P0 | Negative | ✅ `login.spec.ts` |
| TC-AUTH-004 | Submit form with empty username and password | On /auth/login | Required field errors shown on both fields | P1 | Negative | ✅ `login.spec.ts` |
| TC-AUTH-005 | Password field masks input characters | On /auth/login | Password input type="password" | P1 | Functional | ✅ `login.spec.ts` |
| TC-AUTH-006 | Forgot password link navigates to reset page | On /auth/login | Navigated to /requestPasswordResetCode, heading "Reset Password" visible | P2 | Functional | ✅ `login.spec.ts` |
| TC-AUTH-007 | Logout redirects to login page | Logged in as admin | Redirected to /auth/login, login form visible | P0 | Functional | ✅ `login.spec.ts` |
| TC-AUTH-008 | Re-login after failed attempt | On /auth/login | After clearing fields and entering valid credentials, redirected to dashboard | P2 | Functional | ✅ `login.spec.ts` |
| TC-AUTH-009 | BDD — Successful login | On /auth/login | Dashboard visible | P0 | BDD | ✅ `login.feature` |
| TC-AUTH-010 | BDD — Invalid credentials outline | On /auth/login | Error shown for each invalid pair | P1 | BDD | ✅ `login.feature` |
| TC-AUTH-011 | BDD — Logout redirects to login | Logged in | /auth/login URL | P0 | BDD | ✅ `login.feature` |
| TC-AUTH-012 | BDD — Empty form validation | On /auth/login | Required errors visible | P1 | BDD | ✅ `login.feature` |
| TC-AUTH-013 | XSS in username field | On /auth/login | No script execution, error message shown | P1 | Security | ❌ Not automated |
| TC-AUTH-014 | SQL injection in password field | On /auth/login | Login rejected, no data exposed | P1 | Security | ❌ Not automated |
| TC-AUTH-015 | Login on Firefox | On /auth/login (Firefox) | Same behaviour as Chrome | P2 | Cross-browser | ✅ Firefox project |

---

## Module 2 — Dashboard

**User Story:** As an admin, I want to see the dashboard after login so I can navigate to all HRM modules.

### Acceptance Criteria
1. Dashboard heading is visible after login
2. All main navigation menu items are present
3. Quick launch widgets are displayed
4. Admin can navigate to each main module from the dashboard

### Test Cases

| TC ID | Title | Preconditions | Expected Result | Priority | Type | Automated |
|-------|-------|---------------|-----------------|----------|------|-----------|
| TC-DASH-001 | Dashboard loads after login | Logged in as admin | URL contains /dashboard, heading "Dashboard" visible | P0 | Functional | ✅ `dashboard.spec.ts` |
| TC-DASH-002 | Admin menu is visible in nav | Logged in | "Admin" menu item visible in top nav | P1 | Functional | ✅ `dashboard.spec.ts` |
| TC-DASH-003 | PIM menu item is visible | Logged in | "PIM" menu item visible | P1 | Functional | ✅ `dashboard.spec.ts` |
| TC-DASH-004 | Leave menu item is visible | Logged in | "Leave" menu item visible | P1 | Functional | ✅ `dashboard.spec.ts` |
| TC-DASH-005 | Recruitment menu item is visible | Logged in | "Recruitment" menu item visible | P1 | Functional | ✅ `dashboard.spec.ts` |
| TC-DASH-006 | Navigate to PIM from dashboard | Logged in | Clicked PIM → URL contains /pim | P1 | Functional | ✅ `dashboard.spec.ts` |
| TC-DASH-007 | Quick launch widgets displayed | Logged in | At least one widget card visible | P2 | Functional | ✅ `dashboard.spec.ts` |

---

## Module 3 — PIM / Employee Management

**User Story:** As an admin, I want to manage employee records so I can add, search, and maintain staff data.

### Acceptance Criteria
1. Employee list page shows all employees in a table
2. Admin can search for an employee by name
3. Search with unknown name shows "No Records Found"
4. Reset button clears search filters
5. Add button navigates to the Add Employee form
6. Add Employee form accepts first, middle, and last name
7. Saving a valid employee record navigates to the employee profile
8. Submitting the form without required fields shows validation errors

### Equivalence Classes

| Parameter | Valid | Invalid | Boundary |
|-----------|-------|---------|----------|
| First Name | `Tresa` | (empty) | 1 char, 50 chars |
| Last Name | `John` | (empty) | 1 char, 50 chars |
| Search Name | Existing employee name | Unknown name | Empty string |

### Test Cases

| TC ID | Title | Preconditions | Expected Result | Priority | Type | Automated |
|-------|-------|---------------|-----------------|----------|------|-----------|
| TC-PIM-001 | Employee list page loads with table | Logged in, navigate to /viewEmployeeList | Table visible, URL correct | P0 | Functional | ✅ `employee.spec.ts` |
| TC-PIM-002 | Search by employee name returns results | Employee exists in system | Table shows matching records | P1 | Functional | ✅ `employee.spec.ts` |
| TC-PIM-003 | Search with unknown name shows no records | On employee list | "No Records Found" message visible | P1 | Negative | ✅ `employee.spec.ts` |
| TC-PIM-004 | Reset clears search name field | Search performed | Name field empty, default results shown | P2 | Functional | ✅ `employee.spec.ts` |
| TC-PIM-005 | Add button navigates to Add Employee form | On employee list | URL contains /addEmployee, heading visible | P0 | Functional | ✅ `employee.spec.ts` |
| TC-PIM-006 | Add employee with valid names saves successfully | On Add Employee form | Navigated to employee profile page | P0 | Functional | ✅ `employee.spec.ts` |
| TC-PIM-007 | Submit Add Employee form without names | On Add Employee form | Required field validation errors shown | P1 | Negative | ✅ `employee.spec.ts` |
| TC-PIM-008 | Employee ID field visible on form | On Add Employee form | "Employee Id" label visible | P2 | Functional | ✅ `employee.spec.ts` |
| TC-PIM-009 | BDD — Employee list loads | Logged in | Table visible | P0 | BDD | ✅ `employee.feature` |
| TC-PIM-010 | BDD — Navigate to Add Employee | On list | Add Employee heading visible | P0 | BDD | ✅ `employee.feature` |
| TC-PIM-011 | BDD — Search by name | Employee exists | Results shown | P1 | BDD | ✅ `employee.feature` |
| TC-PIM-012 | BDD — No results for unknown employee | On list | No records message | P1 | BDD | ✅ `employee.feature` |
| TC-PIM-013 | BDD — Reset clears filters | Search done | Field empty | P2 | BDD | ✅ `employee.feature` |
| TC-PIM-014 | BDD — Add employee and save | On Add form | Record saved | P0 | BDD | ✅ `employee.feature` |
| TC-PIM-015 | BDD — Validation on empty form | On Add form | Errors visible | P1 | BDD | ✅ `employee.feature` |
| TC-PIM-016 | API — GET /pim/employees returns 200 | Authenticated | Status 200, data array returned | P0 | API | ✅ `employees.api.spec.ts` |
| TC-PIM-017 | API — Response matches employee schema | Authenticated | empNumber, firstName, lastName, employeeId present | P1 | API | ✅ `employees.api.spec.ts` |
| TC-PIM-018 | API — Pagination limit works | Authenticated | Data count ≤ limit value | P1 | API | ✅ `employees.api.spec.ts` |
| TC-PIM-019 | API — Offset returns different records | Authenticated | Page 1 and page 2 records differ | P2 | API | ✅ `employees.api.spec.ts` |
| TC-PIM-020 | API — GET by valid employee ID returns 200 | Authenticated, valid empNumber | Status 200, correct employee returned | P0 | API | ✅ `employees.api.spec.ts` |
| TC-PIM-021 | API — GET by non-existent ID returns 422 | Authenticated | Status 422 | P1 | Negative API | ✅ `employees.api.spec.ts` |
| TC-PIM-022 | API — Content-Type is application/json | Authenticated | Content-Type header contains application/json | P2 | API | ✅ `employees.api.spec.ts` |

---

## Module 4 — Leave Management

**User Story:** As an admin, I want to manage employee leave so I can view, apply, and track leave requests.

### Acceptance Criteria
1. Leave list page shows leave records in a table
2. Table displays Leave Type and Status columns
3. Admin can navigate to Apply Leave page
4. Apply Leave page shows the leave type dropdown
5. Admin can navigate to My Leave List
6. Admin can navigate to Leave Entitlements page

### Test Cases

| TC ID | Title | Preconditions | Expected Result | Priority | Type | Automated |
|-------|-------|---------------|-----------------|----------|------|-----------|
| TC-LVE-001 | Leave list page loads with table | Logged in, navigate to /viewLeaveList | Table and URL correct | P0 | Functional | ✅ `leave.spec.ts` |
| TC-LVE-002 | Leave Type column visible in table | On leave list | "Leave Type" column header visible | P1 | Functional | ✅ `leave.spec.ts` |
| TC-LVE-003 | Status column visible in table | On leave list | "Status" column header visible | P1 | Functional | ✅ `leave.spec.ts` |
| TC-LVE-004 | Navigate to Apply Leave page | On leave list | URL contains /applyLeave, page loads | P1 | Functional | ✅ `leave.spec.ts` |
| TC-LVE-005 | Apply Leave page shows leave type dropdown | On Apply Leave | Dropdown visible | P1 | Functional | ✅ `leave.spec.ts` |
| TC-LVE-006 | Navigate to My Leave List | Logged in | URL contains /viewMyLeaveList | P2 | Functional | ✅ `leave.spec.ts` |
| TC-LVE-007 | Navigate to Leave Entitlements | Logged in | URL contains /viewLeaveEntitlements | P2 | Functional | ✅ `leave.spec.ts` |
| TC-LVE-008 | BDD — Leave list loads | Logged in | Table visible | P0 | BDD | ✅ `leave.feature` |
| TC-LVE-009 | BDD — Leave Type column visible | On list | Column header present | P1 | BDD | ✅ `leave.feature` |
| TC-LVE-010 | BDD — Status column visible | On list | Column header present | P1 | BDD | ✅ `leave.feature` |
| TC-LVE-011 | BDD — Navigate to Apply Leave | Logged in | Page loads | P1 | BDD | ✅ `leave.feature` |
| TC-LVE-012 | BDD — Leave type dropdown visible | On Apply Leave | Dropdown visible | P1 | BDD | ✅ `leave.feature` |
| TC-LVE-013 | BDD — Navigate to My Leave List | Logged in | URL correct | P2 | BDD | ✅ `leave.feature` |
| TC-LVE-014 | API — GET /leave/leave-types returns 200 | Authenticated | Status 200, data array | P0 | API | ✅ `leave.api.spec.ts` |
| TC-LVE-015 | API — Leave type schema is valid | Authenticated | id (number), name (string), deleted (boolean) | P1 | API | ✅ `leave.api.spec.ts` |
| TC-LVE-016 | API — Only active leave types returned | Authenticated | No records with deleted=true | P1 | API | ✅ `leave.api.spec.ts` |
| TC-LVE-017 | API — Meta total matches data count | Authenticated | meta.total === data.length | P2 | API | ✅ `leave.api.spec.ts` |

---

## Module 5 — Recruitment

**User Story:** As an admin, I want to manage job vacancies and candidates so I can track the recruitment pipeline.

### Acceptance Criteria
1. Job Vacancies page loads with correct URL
2. Add button is visible on the vacancies page
3. Clicking Add navigates to the Add Vacancy form
4. Add Vacancy form contains job title dropdown and vacancy name input
5. Submitting the form without required fields shows validation errors
6. Admin can search vacancies by job title
7. Admin can navigate to the Candidates page

### Test Cases

| TC ID | Title | Preconditions | Expected Result | Priority | Type | Automated |
|-------|-------|---------------|-----------------|----------|------|-----------|
| TC-REC-001 | Vacancies page loads successfully | Logged in, navigate to recruitment | URL contains viewJobVacancy or viewCandidates | P0 | Functional | ✅ `recruitment.spec.ts` |
| TC-REC-002 | Add button visible on vacancies page | On vacancies page | "Add" button visible | P0 | Functional | ✅ `recruitment.spec.ts` |
| TC-REC-003 | Add button navigates to Add Vacancy form | On vacancies page | URL contains recruitment, form loads | P0 | Functional | ✅ `recruitment.spec.ts` |
| TC-REC-004 | Job title dropdown visible on Add Vacancy form | On Add Vacancy | Dropdown visible | P1 | Functional | ✅ `recruitment.spec.ts` |
| TC-REC-005 | Vacancy name input visible on Add Vacancy form | On Add Vacancy | Input field visible | P1 | Functional | ✅ `recruitment.spec.ts` |
| TC-REC-006 | Submit Add Vacancy form without required fields | On Add Vacancy | Validation errors shown | P1 | Negative | ✅ `recruitment.spec.ts` |
| TC-REC-007 | Search vacancies by job title | On vacancies page | Results table visible after search | P1 | Functional | ✅ `recruitment.spec.ts` |
| TC-REC-008 | Navigate to Candidates page | Logged in | URL contains /viewCandidates | P1 | Functional | ✅ `recruitment.spec.ts` |
| TC-REC-009 | Candidates page loads context area | On Candidates | Layout context visible | P2 | Functional | ✅ `recruitment.spec.ts` |
| TC-REC-010 | BDD — Vacancies page loads | Logged in | URL correct | P0 | BDD | ✅ `recruitment.feature` |
| TC-REC-011 | BDD — Add button visible | On page | Button visible | P0 | BDD | ✅ `recruitment.feature` |
| TC-REC-012 | BDD — Navigate to Add Vacancy | On page | Form loads | P0 | BDD | ✅ `recruitment.feature` |
| TC-REC-013 | BDD — Form has required fields | On Add form | Dropdown and input visible | P1 | BDD | ✅ `recruitment.feature` |
| TC-REC-014 | BDD — Validation on empty form | On Add form | Errors visible | P1 | BDD | ✅ `recruitment.feature` |
| TC-REC-015 | BDD — Search by job title | On page | Results table visible | P1 | BDD | ✅ `recruitment.feature` |
| TC-REC-016 | BDD — Navigate to Candidates | Logged in | URL correct | P1 | BDD | ✅ `recruitment.feature` |

---

## Module 6 — API (Cross-module)

| TC ID | Title | Preconditions | Expected Result | Priority | Type | Automated |
|-------|-------|---------------|-----------------|----------|------|-----------|
| TC-API-001 | Authenticated session accesses employee endpoint | Valid session cookie | Status 200, data array returned | P0 | API | ✅ `auth.api.spec.ts` |
| TC-API-002 | Authenticated session accesses vacancies endpoint | Valid session cookie | Status 200 | P1 | API | ✅ `auth.api.spec.ts` |
| TC-API-003 | Authenticated session accesses leave types endpoint | Valid session cookie | Status 200 | P1 | API | ✅ `auth.api.spec.ts` |
| TC-API-004 | API responds within 5 seconds | Authenticated | Response time < 5000ms | P2 | Performance | ✅ `auth.api.spec.ts` |

---

## Traceability Matrix Summary

| Module | Total TCs | P0 | P1 | P2 | P3 | Automated | Not Automated |
|--------|-----------|----|----|----|----|-----------|---------------|
| Auth | 15 | 4 | 6 | 4 | 0 | 13 | 2 |
| Dashboard | 7 | 1 | 4 | 2 | 0 | 7 | 0 |
| PIM / Employee | 22 | 7 | 9 | 5 | 0 | 22 | 0 |
| Leave | 17 | 3 | 8 | 5 | 0 | 17 | 0 |
| Recruitment | 16 | 4 | 8 | 3 | 0 | 16 | 0 |
| API | 4 | 1 | 2 | 1 | 0 | 4 | 0 |
| **Total** | **81** | **20** | **37** | **20** | **0** | **79** | **2** |

**Automation coverage: 97.5%**

Not automated: Security tests (XSS, SQL injection) — TC-AUTH-013, TC-AUTH-014

---

## Coverage by Test Type

| Type | Count |
|------|-------|
| Functional | 32 |
| Negative | 10 |
| BDD | 27 |
| API | 11 |
| Cross-browser | 1 |
| Security | 2 (manual) |
| Performance | 1 |
| **Total** | **81** |
