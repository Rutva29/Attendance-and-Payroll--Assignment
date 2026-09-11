import { describe, it, expect } from 'vitest';
import {
  isWeekend,
  isFutureDate,
  calculateWorkingHours,
  classifyAttendance,
  validateAttendanceForm,
  monthRange,
  todayDate,
} from './attendance';

// a weekday a few years out, so this stays future-dated and weekday no matter when the suite runs
function farFutureWeekday() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 5);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().slice(0, 10);
}

describe('isWeekend', () => {
  it('flags Saturday and Sunday', () => {
    expect(isWeekend('2026-09-05')).toBe(true);
    expect(isWeekend('2026-09-06')).toBe(true);
  });

  it('accepts Monday to Friday', () => {
    expect(isWeekend('2026-09-04')).toBe(false);
    expect(isWeekend('2026-09-07')).toBe(false);
  });
});

describe('isFutureDate', () => {
  it('flags a date after today', () => {
    expect(isFutureDate(farFutureWeekday())).toBe(true);
  });

  it('accepts today and past dates', () => {
    expect(isFutureDate(todayDate())).toBe(false);
    expect(isFutureDate('2020-01-01')).toBe(false);
  });
});

describe('calculateWorkingHours', () => {
  it('returns hours between check-in and check-out', () => {
    expect(calculateWorkingHours('09:00', '18:00')).toBe(9);
    expect(calculateWorkingHours('09:00', '13:30')).toBe(4.5);
    expect(calculateWorkingHours('09:15', '17:35')).toBe(8.33);
  });

  it('returns 0 when times are missing or reversed', () => {
    expect(calculateWorkingHours('', '')).toBe(0);
    expect(calculateWorkingHours('18:00', '09:00')).toBe(0);
  });
});

describe('classifyAttendance', () => {
  it('uses the 8 and 4 hour thresholds', () => {
    expect(classifyAttendance(8)).toBe('FULL_DAY');
    expect(classifyAttendance(7.99)).toBe('HALF_DAY');
    expect(classifyAttendance(4)).toBe('HALF_DAY');
    expect(classifyAttendance(3.99)).toBe('ABSENT');
    expect(classifyAttendance(0)).toBe('ABSENT');
  });
});

describe('validateAttendanceForm', () => {
  const valid = { employeeId: '1', date: '2026-09-04', checkIn: '09:00', checkOut: '18:00' };

  it('passes a valid full day', () => {
    expect(validateAttendanceForm(valid)).toEqual({});
  });

  it('passes an absent day with empty times', () => {
    expect(validateAttendanceForm({ ...valid, checkIn: '', checkOut: '' })).toEqual({});
  });

  it('requires employee and date', () => {
    const errors = validateAttendanceForm({ employeeId: '', date: '', checkIn: '', checkOut: '' });
    expect(errors.employeeId).toBeDefined();
    expect(errors.date).toBeDefined();
  });

  it('rejects weekends', () => {
    expect(validateAttendanceForm({ ...valid, date: '2026-09-05' }).date).toMatch(/Saturday or Sunday/);
  });

  it('rejects future dates', () => {
    expect(validateAttendanceForm({ ...valid, date: farFutureWeekday() }).date).toMatch(/future date/);
  });

  it('rejects check-out before or equal to check-in', () => {
    expect(validateAttendanceForm({ ...valid, checkOut: '08:00' }).checkOut).toMatch(/later than check-in/);
    expect(validateAttendanceForm({ ...valid, checkOut: '09:00' }).checkOut).toMatch(/later than check-in/);
  });

  it('rejects a single missing time', () => {
    expect(validateAttendanceForm({ ...valid, checkOut: '' }).checkOut).toMatch(/both check-in and check-out/);
  });
});

describe('monthRange', () => {
  it('handles month lengths and leap years', () => {
    expect(monthRange('2026-02')).toEqual({ startDate: '2026-02-01', endDate: '2026-02-28' });
    expect(monthRange('2028-02')).toEqual({ startDate: '2028-02-01', endDate: '2028-02-29' });
    expect(monthRange('2026-12')).toEqual({ startDate: '2026-12-01', endDate: '2026-12-31' });
  });
});
