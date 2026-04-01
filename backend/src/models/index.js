const { sequelize } = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');

User.hasMany(Invoice, { foreignKey: 'userId' });
Invoice.belongsTo(User, { foreignKey: 'userId' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

Product.hasMany(InvoiceItem, { foreignKey: 'productId' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  sequelize,
  User,
  Product,
  Invoice,
  InvoiceItem
};
