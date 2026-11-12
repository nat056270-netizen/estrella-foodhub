const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryAdjustment = sequelize.define('InventoryAdjustment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  old_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  adjustment_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  new_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.ENUM('damaged', 'expired', 'spoiled', 'missing', 'overstock', 'manual_correction', 'physical_count'),
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'inventory_adjustments',
  timestamps: true
});

module.exports = InventoryAdjustment;
