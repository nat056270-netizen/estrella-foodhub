const Expense = require('../models/Expense');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');
const { Op } = require('sequelize');

exports.getAllExpenses = async (req, res) => {
  try {
    const { start_date, end_date, category } = req.query;
    
    const where = {};
    
    if (start_date && end_date) {
      where.expense_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    if (category) {
      where.category = category;
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['expense_date', 'DESC']]
    });

    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message
    });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense',
      error: error.message
    });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { category, description, amount, expense_date, remarks } = req.body;

    const expense = await Expense.create({
      category,
      description,
      amount,
      expense_date: expense_date || new Date(),
      user_id: req.user.id,
      remarks
    });

    await logActivity(
      req.user.id,
      'Create Expense',
      'Expenses',
      expense.id,
      `Created expense: ${description} - ₱${amount}`,
      req.ip
    );

    const newExpense = await Expense.findByPk(expense.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: newExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.update(req.body);

    await logActivity(
      req.user.id,
      'Update Expense',
      'Expenses',
      expense.id,
      `Updated expense: ${expense.description}`,
      req.ip
    );

    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.destroy();

    await logActivity(
      req.user.id,
      'Delete Expense',
      'Expenses',
      expense.id,
      `Deleted expense: ${expense.description}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
};
