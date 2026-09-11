// same rules as the server, just for instant feedback in the form. server recalculates anyway.

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// parse as UTC so weekday doesn't depend on browser timezone
export function isWeekend(date) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

// YYYY-MM-DD strings compare lexicographically like dates, no parsing needed
export function isFutureDate(date) {
  return date > todayDate();
}

export function calculateWorkingHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const minutes = toMinutes(checkOut) - toMinutes(checkIn);
  return minutes > 0 ? Math.round((minutes / 60) * 100) / 100 : 0;
}

export function classifyAttendance(workingHours) {
  if (workingHours >= 8) return 'FULL_DAY';
  if (workingHours >= 4) return 'HALF_DAY';
  return 'ABSENT';
}

export function validateAttendanceForm({ employeeId, date, checkIn, checkOut }) {
  const errors = {};

  if (!employeeId) {
    errors.employeeId = 'Please select an employee.';
  }

  if (!date) {
    errors.date = 'Please select a date.';
  } else if (isWeekend(date)) {
    errors.date = 'Attendance cannot be recorded for Saturday or Sunday.';
  } else if (isFutureDate(date)) {
    errors.date = 'Attendance cannot be recorded for a future date.';
  }

  if (checkIn && !TIME_PATTERN.test(checkIn)) {
    errors.checkIn = 'Check-in must be a valid time.';
  }
  if (checkOut && !TIME_PATTERN.test(checkOut)) {
    errors.checkOut = 'Check-out must be a valid time.';
  }

  if (Boolean(checkIn) !== Boolean(checkOut)) {
    errors.checkOut = 'Enter both check-in and check-out, or leave both empty for an absent day.';
  } else if (checkIn && checkOut && !errors.checkIn && !errors.checkOut && toMinutes(checkOut) <= toMinutes(checkIn)) {
    errors.checkOut = 'Check-out must be later than check-in.';
  }

  return errors;
}

// local date, no UTC shift
export function todayDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function currentMonth() {
  return todayDate().slice(0, 7);
}

export function monthRange(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { startDate: `${month}-01`, endDate: `${month}-${String(lastDay).padStart(2, '0')}` };
}
