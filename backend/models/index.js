
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

User.belongsTo(Branch, { foreignKey: 'branch_id' });
Branch.hasMany(User, { foreignKey: 'branch_id' });

Branch.hasMany(Procurement, { foreignKey: 'branch_id' });
Procurement.belongsTo(Branch, { foreignKey: 'branch_id' });
Procurement.belongsTo(Produce, { foreignKey: 'produce_id' });
Produce.hasMany(Procurement, { foreignKey: 'produce_id' });

Stock.belongsTo(Branch, { foreignKey: 'branch_id' });
Stock.belongsTo(Produce, { foreignKey: 'produce_id' });
Branch.hasMany(Stock, { foreignKey: 'branch_id' });
Produce.hasMany(Stock, { foreignKey: 'produce_id' });

Sale.belongsTo(Branch, { foreignKey: 'branch_id' });
Sale.belongsTo(Produce, { foreignKey: 'produce_id' });
Sale.belongsTo(Buyer, { foreignKey: 'buyer_id' });
Sale.belongsTo(User, { foreignKey: 'sales_agent_id', as: 'agent' });
Branch.hasMany(Sale, { foreignKey: 'branch_id' });
Produce.hasMany(Sale, { foreignKey: 'produce_id' });
Buyer.hasMany(Sale, { foreignKey: 'buyer_id' });
User.hasMany(Sale, { foreignKey: 'sales_agent_id', as: 'salesAsAgent' });

CreditSale.belongsTo(Branch, { foreignKey: 'branch_id' });
CreditSale.belongsTo(Buyer, { foreignKey: 'buyer_id' });
CreditSale.belongsTo(Produce, { foreignKey: 'produce_id' });
CreditSale.belongsTo(User, { foreignKey: 'sales_agent_id', as: 'agent' });
Branch.hasMany(CreditSale, { foreignKey: 'branch_id' });
Buyer.hasMany(CreditSale, { foreignKey: 'buyer_id' });
Produce.hasMany(CreditSale, { foreignKey: 'produce_id' });
User.hasMany(CreditSale, { foreignKey: 'sales_agent_id', as: 'creditSalesAsAgent' });

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
