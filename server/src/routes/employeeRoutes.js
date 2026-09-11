const { Router } = require('express');
const { param } = require('express-validator');
const employeeController = require('../controllers/employeeController');
const validate = require('../middleware/validate');

const router = Router();

router.get('/', employeeController.list);
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('Employee id must be a positive integer.').toInt(),
  validate,
  employeeController.getById
);

module.exports = router;
