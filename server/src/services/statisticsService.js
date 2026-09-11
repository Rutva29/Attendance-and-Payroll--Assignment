const statisticsRepository = require('../repositories/statisticsRepository');
const { monthRange } = require('../utils/attendanceRules');

const RISK_PERIOD_MONTHS = 3;

async function longestStreak(month) {
  const { startDate, endDate } = monthRange(month);
  const employees = await statisticsRepository.longestStreakByEmployee(startDate, endDate);
  return { month, startDate, endDate, employees };
}

async function payroll(month) {
  const { startDate, endDate } = monthRange(month);
  const today = new Date().toISOString().slice(0, 10);
  const employees = await statisticsRepository.payrollByEmployee(startDate, endDate, today);
  return { month, startDate, endDate, employees };
}

// last 3 months = selected month plus the 2 before it, e.g. 2026-09 covers Jul-Sep
async function risk(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const firstMonth = new Date(Date.UTC(year, monthNumber - RISK_PERIOD_MONTHS, 1));
  const startDate = firstMonth.toISOString().slice(0, 10);
  const { endDate } = monthRange(month);
  const employees = await statisticsRepository.riskByEmployee(startDate, endDate);
  return { month, startDate, endDate, employees };
}

module.exports = { longestStreak, payroll, risk };
