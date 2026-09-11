// keep query keys in one place so fetch and invalidate never drift apart
export const queryKeys = {
  employees: () => ['employees'],
  attendance: (filters) => ['attendance', filters],
  attendanceRoot: () => ['attendance'],
  statisticsRoot: () => ['statistics'],
  attendanceStreak: (month) => ['statistics', 'attendance-streak', month],
  payroll: (month) => ['statistics', 'payroll', month],
  risk: (month) => ['statistics', 'risk', month],
};
