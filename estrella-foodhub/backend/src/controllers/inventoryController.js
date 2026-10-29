const sequelize = require('../config/database');
const { Product, Category, InventoryMovement, InventoryAdjustment, User } = require('../models');
const { logActivity } = require('../utils/activityLogger');
const { Op } = require('sequelize');

exports.getInventory = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status === 'low_stock') {
      where[Op.and] = [
        sequelize.where(
          sequelize.col('current_stock'),
          '<=',
          sequelize.col('minimum_stock')
        ),
        { current_stock: { [Op.gt]: 0 } }
      ];
    } else if (status === 'out_of_stock') {
      where.current_stock = 0;
    } else if (status === 'in_stock') {
      where[Op.and] = sequelize.where(
        sequelize.col('current_stock'),
        '>',
        sequelize.col('minimum_stock')
      );
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

exports.getInventoryMovements = async (req, res) => {
  try {
    const { product_id, type, start_date, end_date } = req.query;
    
    const where = {};
    
    if (product_id) {
      where.product_id = product_id;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const movements = await InventoryMovement.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: movements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory movements',
      error: error.message
    });
  }
};

exports.createAdjustment = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { product_id, adjustment_quantity, reason, remarks } = req.body;

    const product = await Product.findByPk(product_id);

    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const oldQuantity = product.current_stock;
    const newQuantity = oldQuantity + adjustment_quantity;

    if (newQuantity < 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Adjustment would result in negative stock'
      });
    }

    // Create adjustment record
    const adjustment = await InventoryAdjustment.create({
      product_id,
      old_quantity: oldQuantity,
      adjustment_quantity,
      new_quantity: newQuantity,
      reason,
      remarks,
      user_id: req.user.id,
      status: 'approved'
    }, { transaction: t });

    // Update product stock
    await product.update({
      current_stock: newQuantity
    }, { transaction: t });

    // Create inventory movement
    await InventoryMovement.create({
      product_id,
      type: adjustment_quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(adjustment_quantity),
      reference_type: 'adjustment',
      reference_id: adjustment.id,
      user_id: req.user.id,
      notes: `Adjustment: ${reason} - ${remarks || ''}`
    }, { transaction: t });

    await t.commit();

    await logActivity(
      req.user.id,
      'Inventory Adjustment',
      'Inventory',
      adjustment.id,
      `Adjusted ${product.name} by ${adjustment_quantity} (${reason})`,
      req.ip
    );

    const newAdjustment = await InventoryAdjustment.findByPk(adjustment.id, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: newAdjustment
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create adjustment',
      error: error.message
    });
  }
};

exports.getAdjustments = async (req, res) => {
  try {
    const adjustments = await InventoryAdjustment.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: adjustments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adjustments',
      error: error.message
    });
  }
};

exports.getExpiringProducts = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const products = await Product.findAll({
      where: {
        expiration_tracking: true,
        expiration_date: {
          [Op.and]: [
            { [Op.not]: null },
            { [Op.lte]: thirtyDaysFromNow }
          ]
        },
        status: 'active'
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['expiration_date', 'ASC']]
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring products',
      error: error.message
    });
  }
};
