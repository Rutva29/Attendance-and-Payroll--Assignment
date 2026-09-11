const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  isWeekend,
  calculateWorkingHours,
  classifyAttendance,
  monthRange,
} = require('../src/utils/attendanceRules');

test('isWeekend detects Saturday and Sunday only', () => {
  assert.equal(isWeekend('2026-09-05'), true); // Saturday
  assert.equal(isWeekend('2026-09-06'), true); // Sunday
  assert.equal(isWeekend('2026-09-04'), false); // Friday
  assert.equal(isWeekend('2026-09-07'), false); // Monday
});

test('calculateWorkingHours returns the difference in hours with two decimals', () => {
  assert.equal(calculateWorkingHours('09:00', '18:00'), 9);
  assert.equal(calculateWorkingHours('09:15', '17:35'), 8.33);
  assert.equal(calculateWorkingHours('09:00', '13:30'), 4.5);
});

test('calculateWorkingHours returns 0 for missing or reversed times', () => {
  assert.equal(calculateWorkingHours(null, null), 0);
  assert.equal(calculateWorkingHours('09:00', null), 0);
  assert.equal(calculateWorkingHours('18:00', '09:00'), 0);
});

test('classifyAttendance applies the 8 and 4 hour thresholds', () => {
  assert.equal(classifyAttendance(9), 'FULL_DAY');
  assert.equal(classifyAttendance(8), 'FULL_DAY');
  assert.equal(classifyAttendance(7.99), 'HALF_DAY');
  assert.equal(classifyAttendance(4), 'HALF_DAY');
  assert.equal(classifyAttendance(3.99), 'ABSENT');
  assert.equal(classifyAttendance(0), 'ABSENT');
});

test('monthRange returns the first and last calendar date of the month', () => {
  assert.deepEqual(monthRange('2026-02'), { startDate: '2026-02-01', endDate: '2026-02-28' });
  assert.deepEqual(monthRange('2028-02'), { startDate: '2028-02-01', endDate: '2028-02-29' });
  assert.deepEqual(monthRange('2026-09'), { startDate: '2026-09-01', endDate: '2026-09-30' });
});
