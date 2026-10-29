const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { Op } = require('sequelize');

exports.getAllActivityLogs = async (req, res) => {
  try {
    const { user_id, module, action, start_date, end_date, limit = 100 } = req.query;
    
    const where = {};
    
    if (user_id) {
      where.user_id = user_id;
    }
    
    if (module) {
      where.module = module;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const logs = await ActivityLog.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name', 'role'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

exports.getActivityLog = async (req, res) => {
  try {
    const log = await ActivityLog.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name', 'role'] }
      ]
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log',
      error: error.message
    });
  }
};
