const attendanceService = require('../services/attendanceService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await attendanceService.listAttendance(req.query);
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await attendanceService.getAttendance(req.params.id);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await attendanceService.createAttendance(req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await attendanceService.updateAttendance(req.params.id, req.body);
  res.json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await attendanceService.deleteAttendance(req.params.id);
  res.json({ success: true, message: 'Attendance record deleted.' });
});

module.exports = { list, getById, create, update, remove };
