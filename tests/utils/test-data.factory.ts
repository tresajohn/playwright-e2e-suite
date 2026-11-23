import { randomUUID } from 'crypto';

export interface EmployeeData {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
}

export interface VacancyData {
  jobTitle: string;
  vacancyName: string;
  numOfPositions: string;
  description: string;
}

export function createEmployeeData(overrides?: Partial<EmployeeData>): EmployeeData {
  const suffix = randomUUID().slice(0, 8);
  return {
    firstName: 'Auto',
    middleName: 'QA',
    lastName: `Test-${suffix}`,
    employeeId: `EMP-${suffix}`,
    ...overrides,
  };
}

export function createVacancyData(overrides?: Partial<VacancyData>): VacancyData {
  const suffix = randomUUID().slice(0, 8);
  return {
    jobTitle: 'Software Engineer',
    vacancyName: `QA-Role-${suffix}`,
    numOfPositions: '1',
    description: 'Created by automation',
    ...overrides,
  };
}
