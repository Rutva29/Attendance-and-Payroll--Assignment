const { query } = require('express-validator');

const monthQuery = [
  query('month')
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('Month is required in YYYY-MM format.'),
];

module.exports = { monthQuery };
