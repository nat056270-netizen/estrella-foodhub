const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', inventoryController.getInventory);
router.get('/movements', inventoryController.getInventoryMovements);
router.get('/adjustments', inventoryController.getAdjustments);
router.get('/expiring', inventoryController.getExpiringProducts);
router.post('/adjustments', authorize('admin', 'manager', 'inventory_staff'), inventoryController.createAdjustment);

module.exports = router;
