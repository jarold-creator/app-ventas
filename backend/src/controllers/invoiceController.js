const { sequelize, Product, Invoice, InvoiceItem, User } = require('../models');

exports.createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    let total = 0;
    let totalProfit = 0;
    const invoiceItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
      }

      const unitPrice = parseFloat(product.price);
      const costPrice = parseFloat(product.costPrice || 0);
      const unitProfit = unitPrice - costPrice;
      const subtotal = unitPrice * item.quantity;
      const itemProfit = unitProfit * item.quantity;

      total += subtotal;
      totalProfit += itemProfit;

      await product.update({ stock: product.stock - item.quantity }, { transaction });

      invoiceItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        subtotal: subtotal,
        cost: costPrice,
        profit: itemProfit
      });
    }

    const invoice = await Invoice.create(
      { userId, total, profit: totalProfit },
      { transaction }
    );

    for (const item of invoiceItems) {
      await InvoiceItem.create(
        { ...item, invoiceId: invoice.id },
        { transaction }
      );
    }

    await transaction.commit();
    
    res.status(201).json({ invoice, items: invoiceItems });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: invoices } = await Invoice.findAndCountAll({
      include: [
        { model: InvoiceItem, include: [Product] },
        { model: User, attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    res.json({
      invoices,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: InvoiceItem, include: [Product] },
        { model: User, attributes: ['id', 'name', 'email'] }
      ]
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
