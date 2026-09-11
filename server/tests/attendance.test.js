const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer, api } = require('./helpers/testServer');

// seed data stops at 2026-09-04, so 09-07 week is free to use here
const AARAV = 1;
const PRIYA = 2;
const INACTIVE_EMPLOYEE = 6;

before(startTestServer);
after(stopTestServer);

// a weekday a few years out, so this stays future-dated and weekday no matter when the suite runs
function farFutureWeekday() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 5);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().slice(0, 10);
}

test('creates a full-day attendance record and derives hours and type', async () => {
  const { status, body } = await api('POST', '/api/attendance', {
    employeeId: AARAV,
    date: '2026-09-07',
    checkIn: '09:00',
    checkOut: '18:00',
  });

  assert.equal(status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.employeeName, 'Aarav Sharma');
  assert.equal(body.data.date, '2026-09-07');
  assert.equal(body.data.workingHours, 9);
  assert.equal(body.data.attendanceType, 'FULL_DAY');
  assert.equal(body.data.status, 'PRESENT');
});

test('classifies a half day when hours are between 4 and 8', async () => {
  const { status, body } = await api('POST', '/api/attendance', {
    employeeId: AARAV,
    date: '2026-09-08',
    checkIn: '09:00',
    checkOut: '13:30',
  });

  assert.equal(status, 201);
  assert.equal(body.data.workingHours, 4.5);
  assert.equal(body.data.attendanceType, 'HALF_DAY');
});

test('classifies an absent day when times are missing', async () => {
  const { status, body } = await api('POST', '/api/attendance', {
    employeeId: AARAV,
    date: '2026-09-09',
    checkIn: '',
    checkOut: '',
  });

  assert.equal(status, 201);
  assert.equal(body.data.checkIn, null);
  assert.equal(body.data.workingHours, 0);
  assert.equal(body.data.attendanceType, 'ABSENT');
  assert.equal(body.data.status, 'ABSENT');
});

test('classifies an absent day when hours are under 4', async () => {
  const { body } = await api('POST', '/api/attendance', {
    employeeId: AARAV,
    date: '2026-09-10',
    checkIn: '09:00',
    checkOut: '12:00',
  });

  assert.equal(body.data.workingHours, 3);
  assert.equal(body.data.attendanceType, 'ABSENT');
  assert.equal(body.data.status, 'PRESENT');
});

test('ignores working hours and type sent by the client', async () => {
  const { body } = await api('POST', '/api/attendance', {
    employeeId: AARAV,
    date: '2026-09-11',
    checkIn: '09:00',
    checkOut: '13:00',
    workingHours: 12,
    attendanceType: 'FULL_DAY',
  });

  assert.equal(body.data.workingHours, 4);
  assert.equal(body.data.attendanceType, 'HALF_DAY');
});

test('rejects weekend attendance', async () => {
  const saturday = await api('POST', '/api/attendance', { employeeId: PRIYA, date: '2026-09-05', checkIn: '09:00', checkOut: '18:00' });
  const sunday = await api('POST', '/api/attendance', { employeeId: PRIYA, date: '2026-09-06', checkIn: '09:00', checkOut: '18:00' });

  assert.equal(saturday.status, 400);
  assert.equal(sunday.status, 400);
  assert.match(saturday.body.message, /Saturday or Sunday/);
});

test('rejects future-dated attendance', async () => {
  const { status, body } = await api('POST', '/api/attendance', {
    employeeId: PRIYA,
    date: farFutureWeekday(),
    checkIn: '09:00',
    checkOut: '18:00',
  });

  assert.equal(status, 400);
  assert.match(body.message, /future date/);
});

test('rejects duplicate attendance for the same employee and date', async () => {
  const { status, body } = await api('POST', '/api/attendance', {
    employeeId: AARAV,
    date: '2026-09-04',
    checkIn: '09:00',
    checkOut: '18:00',
  });

  assert.equal(status, 409);
  assert.equal(body.success, false);
  assert.match(body.message, /already exists/);
});

test('rejects check-out earlier than or equal to check-in', async () => {
  const earlier = await api('POST', '/api/attendance', { employeeId: PRIYA, date: '2026-09-07', checkIn: '18:00', checkOut: '09:00' });
  const equal = await api('POST', '/api/attendance', { employeeId: PRIYA, date: '2026-09-07', checkIn: '09:00', checkOut: '09:00' });

  assert.equal(earlier.status, 400);
  assert.equal(equal.status, 400);
  assert.match(earlier.body.message, /Check-out must be later/);
});

test('rejects invalid time formats and a single missing time', async () => {
  const badFormat = await api('POST', '/api/attendance', { employeeId: PRIYA, date: '2026-09-07', checkIn: '9am', checkOut: '18:00' });
  const onlyCheckIn = await api('POST', '/api/attendance', { employeeId: PRIYA, date: '2026-09-07', checkIn: '09:00' });

  assert.equal(badFormat.status, 400);
  assert.equal(onlyCheckIn.status, 400);
  assert.match(onlyCheckIn.body.message, /both check-in and check-out/);
});

test('rejects invalid dates and unknown or inactive employees', async () => {
  const badDate = await api('POST', '/api/attendance', { employeeId: PRIYA, date: '2026-13-40', checkIn: '09:00', checkOut: '18:00' });
  const unknown = await api('POST', '/api/attendance', { employeeId: 999, date: '2026-09-07', checkIn: '09:00', checkOut: '18:00' });
  const inactive = await api('POST', '/api/attendance', { employeeId: INACTIVE_EMPLOYEE, date: '2026-09-07', checkIn: '09:00', checkOut: '18:00' });

  assert.equal(badDate.status, 400);
  assert.equal(unknown.status, 404);
  assert.equal(inactive.status, 400);
  assert.match(inactive.body.message, /active employees/);
});

test('updates attendance and recalculates hours and type', async () => {
  const created = await api('POST', '/api/attendance', { employeeId: PRIYA, date: '2026-09-07', checkIn: '09:00', checkOut: '18:00' });
  const id = created.body.data.id;

  const updated = await api('PUT', `/api/attendance/${id}`, { employeeId: PRIYA, date: '2026-09-08', checkIn: '10:00', checkOut: '14:00' });

  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.date, '2026-09-08');
  assert.equal(updated.body.data.workingHours, 4);
  assert.equal(updated.body.data.attendanceType, 'HALF_DAY');

  const fetched = await api('GET', `/api/attendance/${id}`);
  assert.equal(fetched.body.data.attendanceType, 'HALF_DAY');
});

test('update rejects weekends and duplicates but allows keeping the same date', async () => {
  const list = await api('GET', '/api/attendance?employeeId=2&startDate=2026-09-08&endDate=2026-09-08');
  const id = list.body.data[0].id;

  const weekend = await api('PUT', `/api/attendance/${id}`, { employeeId: PRIYA, date: '2026-09-12', checkIn: '09:00', checkOut: '18:00' });
  const duplicate = await api('PUT', `/api/attendance/${id}`, { employeeId: AARAV, date: '2026-09-08', checkIn: '09:00', checkOut: '18:00' });
  const sameDate = await api('PUT', `/api/attendance/${id}`, { employeeId: PRIYA, date: '2026-09-08', checkIn: '09:00', checkOut: '18:00' });
  const missing = await api('PUT', '/api/attendance/99999', { employeeId: PRIYA, date: '2026-09-08', checkIn: '09:00', checkOut: '18:00' });

  assert.equal(weekend.status, 400);
  assert.equal(duplicate.status, 409);
  assert.equal(sameDate.status, 200);
  assert.equal(sameDate.body.data.attendanceType, 'FULL_DAY');
  assert.equal(missing.status, 404);
});

test('deletes attendance and returns 404 afterwards', async () => {
  const list = await api('GET', '/api/attendance?employeeId=2&startDate=2026-09-08&endDate=2026-09-08');
  const id = list.body.data[0].id;

  const deleted = await api('DELETE', `/api/attendance/${id}`);
  const again = await api('DELETE', `/api/attendance/${id}`);
  const fetched = await api('GET', `/api/attendance/${id}`);

  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.success, true);
  assert.equal(again.status, 404);
  assert.equal(fetched.status, 404);
});

test('filters attendance by employee, date range and type, sorted by date descending', async () => {
  const { status, body } = await api(
    'GET',
    '/api/attendance?employeeId=1&startDate=2026-08-03&endDate=2026-08-14&attendanceType=FULL_DAY'
  );

  assert.equal(status, 200);
  assert.equal(body.data.length, 8);
  assert.ok(body.data.every((row) => row.employeeId === 1 && row.attendanceType === 'FULL_DAY'));
  assert.ok(body.data.every((row) => row.date >= '2026-08-03' && row.date <= '2026-08-14'));
  assert.equal(body.data[0].date, '2026-08-14');
  assert.equal(body.data[body.data.length - 1].date, '2026-08-03');
  assert.equal(body.data[0].employeeName, 'Aarav Sharma');
});

test('filter validation rejects bad values', async () => {
  const badType = await api('GET', '/api/attendance?attendanceType=LATE');
  const reversedRange = await api('GET', '/api/attendance?startDate=2026-09-10&endDate=2026-09-01');

  assert.equal(badType.status, 400);
  assert.equal(reversedRange.status, 400);
});

test('lists only active employees', async () => {
  const { status, body } = await api('GET', '/api/employees');

  assert.equal(status, 200);
  assert.equal(body.data.length, 5);
  assert.ok(body.data.every((employee) => employee.status === 'ACTIVE'));
});
