const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/', activityLogController.getAllActivityLogs);
router.get('/:id', activityLogController.getActivityLog);

module.exports = router;
