const { Router } = require('express');
const attendanceController = require('../controllers/attendanceController');
const validate = require('../middleware/validate');
const { attendanceBody, attendanceId, attendanceFilters } = require('../validators/attendanceValidators');

const router = Router();

router.get('/', attendanceFilters, validate, attendanceController.list);
router.get('/:id', attendanceId, validate, attendanceController.getById);
router.post('/', attendanceBody, validate, attendanceController.create);
router.put('/:id', attendanceId, attendanceBody, validate, attendanceController.update);
router.delete('/:id', attendanceId, validate, attendanceController.remove);

module.exports = router;
