// used by validation, the service layer and tests
// client/src/utils/attendance.js has the same rules for instant UI feedback

const ATTENDANCE_TYPES = ['FULL_DAY', 'HALF_DAY', 'ABSENT'];

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// parse as UTC so weekday doesn't depend on server timezone
function isWeekend(date) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

// YYYY-MM-DD strings compare lexicographically like dates, no parsing needed
function isFutureDate(date) {
  const today = new Date().toISOString().slice(0, 10);
  return date > today;
}

function calculateWorkingHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const minutes = toMinutes(checkOut) - toMinutes(checkIn);
  return minutes > 0 ? Math.round((minutes / 60) * 100) / 100 : 0;
}

function classifyAttendance(workingHours) {
  if (workingHours >= 8) return 'FULL_DAY';
  if (workingHours >= 4) return 'HALF_DAY';
  return 'ABSENT';
}

function monthRange(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

module.exports = {
  ATTENDANCE_TYPES,
  toMinutes,
  isWeekend,
  isFutureDate,
  calculateWorkingHours,
  classifyAttendance,
  monthRange,
};
