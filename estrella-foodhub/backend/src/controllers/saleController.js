const sequelize = require('../config/database');
const { Sale, SaleItem, Product, Customer, User } = require('../models');
const InventoryMovement = require('../models/InventoryMovement');
const { logActivity } = require('../utils/activityLogger');
const { generateTransactionNumber } = require('../utils/generateNumber');
const { Op } = require('sequelize');

exports.createSale = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { customer_id, items, payment_method, amount_received, discount = 0, tax = 0 } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'No items in the cart'
      });
    }

    // Calculate totals and validate stock
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product_id}`
        });
      }

      if (product.status !== 'active') {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Product is not active: ${product.name}`
        });
      }

      // Check expiration
      if (product.expiration_tracking && product.expiration_date) {
        const expirationDate = new Date(product.expiration_date);
        if (expirationDate < new Date()) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Product has expired: ${product.name}`
          });
        }
      }

      // Check stock availability
      if (product.current_stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.current_stock}`
        });
      }

      subtotal += product.selling_price * item.quantity;
    }

    const total = subtotal - discount + tax;
    const change = payment_method === 'cash' ? amount_received - total : 0;

    // Create sale
    const transactionNumber = generateTransactionNumber();
    const sale = await Sale.create({
      transaction_number: transactionNumber,
      customer_id: customer_id || null,
      cashier_id: req.user.id,
      subtotal,
      discount,
      tax,
      total,
      payment_method,
      amount_received: amount_received || total,
      change_amount: change,
      status: 'completed'
    }, { transaction: t });

    // Create sale items and update inventory
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      const itemSubtotal = product.selling_price * item.quantity;

      // Create sale item
      await SaleItem.create({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.selling_price,
        subtotal: itemSubtotal
      }, { transaction: t });

      // Update product stock
      await product.update({
        current_stock: product.current_stock - item.quantity
      }, { transaction: t });

      // Create inventory movement
      await InventoryMovement.create({
        product_id: item.product_id,
        type: 'out',
        quantity: item.quantity,
        reference_type: 'sale',
        reference_id: sale.id,
        user_id: req.user.id,
        notes: `Sale: ${transactionNumber}`
      }, { transaction: t });
    }

    await t.commit();

    await logActivity(
      req.user.id,
      'Create Sale',
      'Sales',
      sale.id,
      `Processed sale ${transactionNumber} - Total: ₱${total}`,
      req.ip
    );

    // Fetch complete sale data
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Customer, as: 'customer' },
        { model: User, as: 'cashier', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: completeSale
    });
  } catch (error) {
    await t.rollback();
    console.error('Sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process sale',
      error: error.message
    });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const { start_date, end_date, payment_method, cashier_id } = req.query;
    
    const where = {};
    
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    if (payment_method) {
      where.payment_method = payment_method;
    }
    
    if (cashier_id) {
      where.cashier_id = cashier_id;
    }

    const sales = await Sale.findAll({
      where,
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
        },
        { model: Customer, as: 'customer', attributes: ['id', 'name'] },
        { model: User, as: 'cashier', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales',
      error: error.message
    });
  }
};

exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Customer, as: 'customer' },
        { model: User, as: 'cashier', attributes: ['id', 'first_name', 'last_name', 'username'] }
      ]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale',
      error: error.message
    });
  }
};

exports.voidSale = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: SaleItem, as: 'items' }]
    });

    if (!sale) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    if (sale.status !== 'completed') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Sale cannot be voided'
      });
    }

    // Restore inventory
    for (const item of sale.items) {
      const product = await Product.findByPk(item.product_id);
      await product.update({
        current_stock: product.current_stock + item.quantity
      }, { transaction: t });

      // Create inventory movement
      await InventoryMovement.create({
        product_id: item.product_id,
        type: 'in',
        quantity: item.quantity,
        reference_type: 'adjustment',
        reference_id: sale.id,
        user_id: req.user.id,
        notes: `Void sale: ${sale.transaction_number}`
      }, { transaction: t });
    }

    await sale.update({ status: 'void' }, { transaction: t });

    await t.commit();

    await logActivity(
      req.user.id,
      'Void Sale',
      'Sales',
      sale.id,
      `Voided sale ${sale.transaction_number}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Sale voided successfully'
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to void sale',
      error: error.message
    });
  }
};
