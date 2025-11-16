
const sequelize = require('../config/sequelize');
const User = require('./user');
const Branch = require('./branch');
const Produce = require('./produce');
const Procurement = require('./procurement');
const Sale = require('./sale');
const CreditSale = require('./creditSale');
const Stock = require('./stock');
const Buyer = require('./buyer');

// Associations
User.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(User, { foreignKey: 'branchId' });

Branch.hasMany(Procurement, { foreignKey: 'branchId' });
Procurement.belongsTo(Branch, { foreignKey: 'branchId' });
Procurement.belongsTo(Produce, { foreignKey: 'produceId' });
Produce.hasMany(Procurement, { foreignKey: 'produceId' });

Stock.belongsTo(Branch, { foreignKey: 'branchId' });
Stock.belongsTo(Produce, { foreignKey: 'produceId' });
Branch.hasMany(Stock, { foreignKey: 'branchId' });
Produce.hasMany(Stock, { foreignKey: 'produceId' });

Sale.belongsTo(Branch, { foreignKey: 'branchId' });
Sale.belongsTo(Produce, { foreignKey: 'produceId' });
Sale.belongsTo(Buyer, { foreignKey: 'buyerId' });
Sale.belongsTo(User, { foreignKey: 'salesAgentId', as: 'agent' });
Branch.hasMany(Sale, { foreignKey: 'branchId' });
Produce.hasMany(Sale, { foreignKey: 'produceId' });
Buyer.hasMany(Sale, { foreignKey: 'buyerId' });
User.hasMany(Sale, { foreignKey: 'salesAgentId', as: 'salesAsAgent' });

CreditSale.belongsTo(Branch, { foreignKey: 'branchId' });
CreditSale.belongsTo(Buyer, { foreignKey: 'buyerId' });
CreditSale.belongsTo(Produce, { foreignKey: 'produceId' });
CreditSale.belongsTo(User, { foreignKey: 'salesAgentId', as: 'agent' });
Branch.hasMany(CreditSale, { foreignKey: 'branchId' });
Buyer.hasMany(CreditSale, { foreignKey: 'buyerId' });
Produce.hasMany(CreditSale, { foreignKey: 'produceId' });
User.hasMany(CreditSale, { foreignKey: 'salesAgentId', as: 'creditSalesAsAgent' });

// Export all models and sequelize
module.exports = {
  sequelize,
  User,
  Branch,
  Produce,
  Procurement,
  Sale,
  CreditSale,
  Stock,
  Buyer,
};
