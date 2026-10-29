const sequelize = require('../config/database');
const { Purchase, PurchaseItem, Product, Supplier, User } = require('../models');
const InventoryMovement = require('../models/InventoryMovement');
const { logActivity } = require('../utils/activityLogger');
const { generatePurchaseNumber } = require('../utils/generateNumber');
const { Op } = require('sequelize');

exports.createPurchase = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { supplier_id, items, notes } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'No items in purchase order'
      });
    }

    // Calculate total cost
    let totalCost = 0;
    for (const item of items) {
      totalCost += item.cost_price * item.quantity;
    }

    // Create purchase
    const purchaseNumber = generatePurchaseNumber();
    const purchase = await Purchase.create({
      purchase_number: purchaseNumber,
      supplier_id,
      user_id: req.user.id,
      purchase_date: new Date(),
      total_cost: totalCost,
      status: 'pending',
      notes
    }, { transaction: t });

    // Create purchase items
    for (const item of items) {
      await PurchaseItem.create({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        cost_price: item.cost_price,
        subtotal: item.cost_price * item.quantity,
        batch_number: item.batch_number || null,
        expiration_date: item.expiration_date || null
      }, { transaction: t });
    }

    await t.commit();

    await logActivity(
      req.user.id,
      'Create Purchase',
      'Purchases',
      purchase.id,
      `Created purchase order ${purchaseNumber}`,
      req.ip
    );

    const completePurchase = await Purchase.findByPk(purchase.id, {
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: completePurchase
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase',
      error: error.message
    });
  }
};

exports.receivePurchase = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{ model: PurchaseItem, as: 'items' }]
    });

    if (!purchase) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    if (purchase.status === 'received') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Purchase already received'
      });
    }

    // Update inventory for each item
    for (const item of purchase.items) {
      const product = await Product.findByPk(item.product_id);
      
      // Update stock
      await product.update({
        current_stock: product.current_stock + item.quantity,
        cost_price: item.cost_price
      }, { transaction: t });

      // Update expiration if tracking
      if (item.expiration_date && product.expiration_tracking) {
        await product.update({
          expiration_date: item.expiration_date
        }, { transaction: t });
      }

      // Create inventory movement
      await InventoryMovement.create({
        product_id: item.product_id,
        type: 'in',
        quantity: item.quantity,
        reference_type: 'purchase',
        reference_id: purchase.id,
        user_id: req.user.id,
        notes: `Purchase: ${purchase.purchase_number}`
      }, { transaction: t });
    }

    await purchase.update({ status: 'received' }, { transaction: t });

    await t.commit();

    await logActivity(
      req.user.id,
      'Receive Purchase',
      'Purchases',
      purchase.id,
      `Received purchase ${purchase.purchase_number}`,
      req.ip
    );

    const updatedPurchase = await Purchase.findByPk(purchase.id, {
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Supplier, as: 'supplier' }
      ]
    });

    res.json({
      success: true,
      message: 'Purchase received successfully',
      data: updatedPurchase
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to receive purchase',
      error: error.message
    });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const { start_date, end_date, supplier_id, status } = req.query;
    
    const where = {};
    
    if (start_date && end_date) {
      where.purchase_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    if (supplier_id) {
      where.supplier_id = supplier_id;
    }
    
    if (status) {
      where.status = status;
    }

    const purchases = await Purchase.findAll({
      where,
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
        },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
      error: error.message
    });
  }
};

exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase',
      error: error.message
    });
  }
};
