const statisticsService = require('../services/statisticsService');
const asyncHandler = require('../utils/asyncHandler');

const attendanceStreak = asyncHandler(async (req, res) => {
  const data = await statisticsService.longestStreak(req.query.month);
  res.json({ success: true, data });
});

const payroll = asyncHandler(async (req, res) => {
  const data = await statisticsService.payroll(req.query.month);
  res.json({ success: true, data });
});

const risk = asyncHandler(async (req, res) => {
  const data = await statisticsService.risk(req.query.month);
  res.json({ success: true, data });
});

module.exports = { attendanceStreak, payroll, risk };
