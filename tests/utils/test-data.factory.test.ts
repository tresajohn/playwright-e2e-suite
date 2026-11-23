import { createEmployeeData, createVacancyData } from './test-data.factory';

// Two calls must produce distinct values — collision guard for parallel runs
const a = createEmployeeData();
const b = createEmployeeData();
if (a.lastName === b.lastName)
  throw new Error(`Collision: both lastName="${a.lastName}" — factory is not per-call unique`);
if (a.employeeId === b.employeeId) throw new Error(`Collision: both employeeId="${a.employeeId}"`);

// Shape checks
if (!a.employeeId.startsWith('EMP-'))
  throw new Error(`employeeId must start with EMP-, got: ${a.employeeId}`);
if (!a.lastName.startsWith('Test-'))
  throw new Error(`lastName must start with Test-, got: ${a.lastName}`);

// Override spread
const override = createEmployeeData({ firstName: 'Jane' });
if (override.firstName !== 'Jane')
  throw new Error(`Override not applied, got: ${override.firstName}`);

// Vacancy factory
const v = createVacancyData();
if (!v.vacancyName.startsWith('QA-Role-'))
  throw new Error(`vacancyName must start with QA-Role-, got: ${v.vacancyName}`);

const vo = createVacancyData({ jobTitle: 'DevOps Engineer' });
if (vo.jobTitle !== 'DevOps Engineer')
  throw new Error(`Vacancy override not applied, got: ${vo.jobTitle}`);

console.log('All factory tests passed');
