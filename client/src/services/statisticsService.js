import api from './api';

export const statisticsService = {
  attendanceStreak: (month) => api.get('/statistics/attendance-streak', { params: { month } }),
  payroll: (month) => api.get('/statistics/payroll', { params: { month } }),
  risk: (month) => api.get('/statistics/risk', { params: { month } }),
};
