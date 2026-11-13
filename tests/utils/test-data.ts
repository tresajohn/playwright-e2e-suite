export const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || 'Admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

export const INVALID_USER = {
  username: 'invaliduser',
  password: 'wrongpassword',
};

export const NEW_EMPLOYEE = {
  firstName: 'Tresa',
  middleName: 'QA',
  lastName: `Demo${Date.now().toString().slice(-4)}`,
  employeeId: `EMP${Date.now().toString().slice(-5)}`,
};

export const LEAVE_DATA = {
  leaveType: 'CAN - FMLA',
  fromDate: '2025-12-01',
  toDate: '2025-12-02',
  comment: 'Automation test leave request',
};

export const VACANCY_DATA = {
  jobTitle: 'Software Engineer',
  vacancyName: `Automation QA Engineer ${Date.now().toString().slice(-4)}`,
  numOfPositions: '2',
  description: 'Created via Playwright automation test',
};
