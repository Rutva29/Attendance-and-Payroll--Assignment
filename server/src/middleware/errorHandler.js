const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
}

function errorHandler(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body must be valid JSON.' });
  }

  // unique constraint caught a duplicate, e.g. two requests at once
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Attendance already exists for this employee on the selected date.' });
  }

  console.error(error);
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
}

module.exports = { notFoundHandler, errorHandler };
