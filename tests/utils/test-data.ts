export const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || 'Admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

export const INVALID_USER = {
  username: 'invaliduser',
  password: 'wrongpassword',
};

export const LEAVE_DATA = {
  leaveType: 'CAN - FMLA',
  fromDate: '2025-12-01',
  toDate: '2025-12-02',
  comment: 'Automation test leave request',
};
