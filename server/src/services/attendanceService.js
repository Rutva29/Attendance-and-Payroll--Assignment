const attendanceRepository = require('../repositories/attendanceRepository');
const employeeRepository = require('../repositories/employeeRepository');
const ApiError = require('../utils/ApiError');
const { calculateWorkingHours, classifyAttendance } = require('../utils/attendanceRules');

// always recalculate working hours/type here, never trust the client's values
async function buildRecord({ employeeId, date, checkIn, checkOut }, excludeId = null) {
  const employee = await employeeRepository.findById(employeeId);
  if (!employee) {
    throw new ApiError(404, 'Employee not found.');
  }
  if (employee.status !== 'ACTIVE') {
    throw new ApiError(400, 'Attendance can only be recorded for active employees.');
  }

  const duplicate = await attendanceRepository.findByEmployeeAndDate(employeeId, date, excludeId);
  if (duplicate) {
    throw new ApiError(409, 'Attendance already exists for this employee on the selected date.');
  }

  const workingHours = calculateWorkingHours(checkIn, checkOut);
  return {
    employeeId,
    date,
    checkIn: checkIn || null,
    checkOut: checkOut || null,
    workingHours,
    attendanceType: classifyAttendance(workingHours),
    status: checkIn && checkOut ? 'PRESENT' : 'ABSENT',
  };
}

async function listAttendance(filters) {
  return attendanceRepository.findAll(filters);
}

async function getAttendance(id) {
  const record = await attendanceRepository.findById(id);
  if (!record) {
    throw new ApiError(404, 'Attendance record not found.');
  }
  return record;
}

async function createAttendance(input) {
  const record = await buildRecord(input);
  const id = await attendanceRepository.create(record);
  return attendanceRepository.findById(id);
}

async function updateAttendance(id, input) {
  await getAttendance(id);
  const record = await buildRecord(input, id);
  await attendanceRepository.update(id, record);
  return attendanceRepository.findById(id);
}

async function deleteAttendance(id) {
  const deleted = await attendanceRepository.remove(id);
  if (!deleted) {
    throw new ApiError(404, 'Attendance record not found.');
  }
}

module.exports = { listAttendance, getAttendance, createAttendance, updateAttendance, deleteAttendance };
