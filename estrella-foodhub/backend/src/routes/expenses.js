const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', expenseController.getAllExpenses);
router.get('/:id', expenseController.getExpense);
router.post('/', authorize('admin', 'manager'), expenseController.createExpense);
router.put('/:id', authorize('admin', 'manager'), expenseController.updateExpense);
router.delete('/:id', authorize('admin'), expenseController.deleteExpense);

module.exports = router;
