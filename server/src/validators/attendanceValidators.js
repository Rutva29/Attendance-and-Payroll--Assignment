const { body, param, query } = require('express-validator');
const { ATTENDANCE_TYPES, isWeekend, isFutureDate, toMinutes } = require('../utils/attendanceRules');

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const dateField = (chain) =>
  chain
    .isDate({ format: 'YYYY-MM-DD', strictMode: true })
    .withMessage('Date must be a valid date in YYYY-MM-DD format.');

const timeField = (chain, label) =>
  chain
    .optional({ values: 'falsy' })
    .matches(TIME_PATTERN)
    .withMessage(`${label} must be a time in HH:MM format.`);

const attendanceBody = [
  body('employeeId').isInt({ min: 1 }).withMessage('Employee is required.').toInt(),
  dateField(body('date'))
    .custom((date) => !isWeekend(date))
    .withMessage('Attendance cannot be recorded for Saturday or Sunday.')
    .custom((date) => !isFutureDate(date))
    .withMessage('Attendance cannot be recorded for a future date.'),
  timeField(body('checkIn'), 'Check-in'),
  timeField(body('checkOut'), 'Check-out'),
  body().custom(({ checkIn, checkOut }) => {
    if (Boolean(checkIn) !== Boolean(checkOut)) {
      throw new Error('Provide both check-in and check-out, or leave both empty for an absent day.');
    }
    if (checkIn && checkOut && toMinutes(checkOut) <= toMinutes(checkIn)) {
      throw new Error('Check-out must be later than check-in.');
    }
    return true;
  }),
];

const attendanceId = [param('id').isInt({ min: 1 }).withMessage('Attendance id must be a positive integer.').toInt()];

const attendanceFilters = [
  query('employeeId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Employee filter must be a positive integer.').toInt(),
  dateField(query('startDate').optional({ values: 'falsy' })),
  dateField(query('endDate').optional({ values: 'falsy' })),
  query('attendanceType')
    .optional({ values: 'falsy' })
    .isIn(ATTENDANCE_TYPES)
    .withMessage(`Attendance type must be one of ${ATTENDANCE_TYPES.join(', ')}.`),
  query().custom(({ startDate, endDate }) => {
    if (startDate && endDate && startDate > endDate) {
      throw new Error('Start date cannot be later than end date.');
    }
    return true;
  }),
];

module.exports = { attendanceBody, attendanceId, attendanceFilters };
