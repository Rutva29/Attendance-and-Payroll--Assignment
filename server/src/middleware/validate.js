const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// runs after the validator chains, turns the first error into a 400
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, errors.array()[0].msg));
  }
  next();
}

module.exports = validate;
