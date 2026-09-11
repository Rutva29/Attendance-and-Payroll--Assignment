const { Router } = require('express');
const statisticsController = require('../controllers/statisticsController');
const validate = require('../middleware/validate');
const { monthQuery } = require('../validators/statisticsValidators');

const router = Router();

router.get('/attendance-streak', monthQuery, validate, statisticsController.attendanceStreak);
router.get('/payroll', monthQuery, validate, statisticsController.payroll);
router.get('/risk', monthQuery, validate, statisticsController.risk);

module.exports = router;
