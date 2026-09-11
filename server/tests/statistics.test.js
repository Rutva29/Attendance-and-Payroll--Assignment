const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer, api } = require('./helpers/testServer');

before(startTestServer);
after(stopTestServer);

const byName = (rows, name) => rows.find((row) => row.employeeName === name);

test('longest streak counts consecutive weekdays and breaks only on absences, not weekends', async () => {
  const { status, body } = await api('GET', '/api/statistics/attendance-streak?month=2026-08');
  const rows = body.data.employees;

  assert.equal(status, 200);
  assert.equal(body.data.startDate, '2026-08-01');
  assert.equal(body.data.endDate, '2026-08-31');
  assert.equal(rows.length, 5);

  // Perfect attendance from 10 Aug to the end of the month; the weekends in between
  // (15-16 and 22-23 Aug) don't break the streak since they aren't payable days.
  assert.deepEqual(byName(rows, 'Aarav Sharma'), {
    employeeId: 1,
    employeeName: 'Aarav Sharma',
    designation: 'Software Engineer',
    longestStreak: 16,
    startDate: '2026-08-10',
    endDate: '2026-08-31',
  });

  // Absent every Friday in August, so the best run is Mon-Thu.
  const priya = byName(rows, 'Priya Patel');
  assert.equal(priya.longestStreak, 4);
  assert.equal(priya.startDate, '2026-08-03');
  assert.equal(priya.endDate, '2026-08-06');

  // Absent on Mondays and Fridays, so Tue-Thu is the longest run.
  const rahul = byName(rows, 'Rahul Verma');
  assert.equal(rahul.longestStreak, 3);
  assert.equal(rahul.startDate, '2026-08-04');
  assert.equal(rahul.endDate, '2026-08-06');
});

test('longest streak treats half days as payable and is limited to the selected month', async () => {
  const { body } = await api('GET', '/api/statistics/attendance-streak?month=2026-09');
  const rows = body.data.employees;

  // 1 Sep to 4 Sep with a half day on 3 Sep still counts as 4 consecutive days.
  assert.equal(byName(rows, 'Aarav Sharma').longestStreak, 4);
  assert.equal(byName(rows, 'Aarav Sharma').startDate, '2026-09-01');
  // Absent on 1 Sep, present 2 to 4 Sep.
  assert.equal(byName(rows, 'Vikram Singh').longestStreak, 3);
  assert.equal(byName(rows, 'Vikram Singh').startDate, '2026-09-02');
});

test('longest streak returns 0 for employees with no payable days in the month', async () => {
  const { body } = await api('GET', '/api/statistics/attendance-streak?month=2026-01');

  assert.equal(body.data.employees.length, 5);
  assert.ok(body.data.employees.every((row) => row.longestStreak === 0 && row.startDate === null));
});

test('payroll uses the real Monday-Friday count and applies half and absent deductions', async () => {
  const { status, body } = await api('GET', '/api/statistics/payroll?month=2026-08');
  const rows = body.data.employees;

  assert.equal(status, 200);
  // August 2026 has 21 working days (1 Aug is a Saturday).
  assert.ok(rows.every((row) => row.totalWorkingDays === 21));

  // 60000 / 21 = 2857.14 per day, 1 half day and 1 absence.
  assert.deepEqual(byName(rows, 'Aarav Sharma'), {
    employeeId: 1,
    employeeName: 'Aarav Sharma',
    designation: 'Software Engineer',
    monthlySalary: 60000,
    totalWorkingDays: 21,
    perDaySalary: 2857.14,
    halfDays: 1,
    absentDays: 1,
    halfDayDeduction: 1428.57,
    absentDeduction: 2857.14,
    totalDeduction: 4285.71,
    netPayable: 55714.29,
  });

  const sneha = byName(rows, 'Sneha Iyer');
  assert.equal(sneha.totalDeduction, 0);
  assert.equal(sneha.netPayable, 52000);
});

test('payroll working days differ per month', async () => {
  const july = await api('GET', '/api/statistics/payroll?month=2026-07');
  const september = await api('GET', '/api/statistics/payroll?month=2026-09');
  const february = await api('GET', '/api/statistics/payroll?month=2027-02');

  assert.equal(july.body.data.employees[0].totalWorkingDays, 23);
  assert.equal(september.body.data.employees[0].totalWorkingDays, 22);
  assert.equal(february.body.data.employees[0].totalWorkingDays, 20);
});

test('risk score covers the selected month and the two months before it', async () => {
  const { status, body } = await api('GET', '/api/statistics/risk?month=2026-09');
  const rows = body.data.employees;

  assert.equal(status, 200);
  assert.equal(body.data.startDate, '2026-07-01');
  assert.equal(body.data.endDate, '2026-09-30');

  // 19 absences (38 points) + 5 half days (5 points) over 48 recorded days.
  assert.deepEqual(byName(rows, 'Rahul Verma'), {
    employeeId: 3,
    employeeName: 'Rahul Verma',
    designation: 'Sales Executive',
    totalWorkingDays: 48,
    fullDays: 24,
    halfDays: 5,
    absentDays: 19,
    penaltyPoints: 43,
    riskScore: 0.9,
    riskCategory: 'HIGH',
  });

  const priya = byName(rows, 'Priya Patel');
  assert.equal(priya.penaltyPoints, 19);
  assert.equal(priya.riskScore, 0.4);
  assert.equal(priya.riskCategory, 'MEDIUM');

  const sneha = byName(rows, 'Sneha Iyer');
  assert.equal(sneha.penaltyPoints, 1);
  assert.equal(sneha.riskScore, 0.02);
  assert.equal(sneha.riskCategory, 'LOW');

  // Highest risk first.
  assert.equal(rows[0].employeeName, 'Rahul Verma');
});

test('risk score reports NO_DATA when the period has no attendance', async () => {
  const { body } = await api('GET', '/api/statistics/risk?month=2025-12');

  assert.equal(body.data.startDate, '2025-10-01');
  assert.ok(body.data.employees.every((row) => row.riskScore === null && row.riskCategory === 'NO_DATA'));
});

test('statistics require a valid month', async () => {
  const missing = await api('GET', '/api/statistics/payroll');
  const invalid = await api('GET', '/api/statistics/risk?month=2026-13');

  assert.equal(missing.status, 400);
  assert.equal(invalid.status, 400);
});
