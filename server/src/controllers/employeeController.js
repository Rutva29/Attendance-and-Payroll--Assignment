const employeeRepository = require('../repositories/employeeRepository');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await employeeRepository.findActive();
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const employee = await employeeRepository.findById(req.params.id);
  if (!employee) {
    throw new ApiError(404, 'Employee not found.');
  }
  res.json({ success: true, data: employee });
});

module.exports = { list, getById };
