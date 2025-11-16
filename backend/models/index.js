const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Define models
const Branch = sequelize.define('branches', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  location: { type: DataTypes.STRING(255) },
}, { tableName: 'branches' });

const User = sequelize.define('users', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password: { type: DataTypes.STRING(255), allowNull: false },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(15) },
  role: { type: DataTypes.ENUM('CEO', 'Manager', 'Sales Agent'), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users' });

User.belongsTo(Branch, { foreignKey: 'branch_id' });
User.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

const Produce = sequelize.define('produce', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  description: { type: DataTypes.TEXT },
}, { tableName: 'produce' });

const Buyer = sequelize.define('buyers', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(15) },
  email: { type: DataTypes.STRING(100) },
  location: { type: DataTypes.STRING(255) },
}, { tableName: 'buyers' });
Buyer.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

const Dealer = sequelize.define('dealers', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(15) },
  email: { type: DataTypes.STRING(100) },
  location: { type: DataTypes.STRING(255) },
}, { tableName: 'dealers' });

const Procurement = sequelize.define('procurement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dealer_name: { type: DataTypes.STRING(100) },
  dealer_phone: { type: DataTypes.STRING(15) },
  tonnage: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cost_per_ton: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  selling_price_per_ton: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  procurement_date: { type: DataTypes.DATEONLY, allowNull: false },
  procurement_time: { type: DataTypes.TIME },
}, { tableName: 'procurement' });
Procurement.belongsTo(Branch, { foreignKey: 'branch_id' });
Procurement.belongsTo(Produce, { foreignKey: 'produce_id' });
Procurement.belongsTo(Dealer, { foreignKey: 'dealer_id' });
Procurement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

const Stock = sequelize.define('stock', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  current_tonnage: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
}, { tableName: 'stock' });
Stock.belongsTo(Branch, { foreignKey: 'branch_id' });
Stock.belongsTo(Produce, { foreignKey: 'produce_id' });

const Sale = sequelize.define('sales', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyer_name: { type: DataTypes.STRING(100) },
  buyer_phone: { type: DataTypes.STRING(15) },
  tonnage: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  price_per_ton: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  payment_status: { type: DataTypes.ENUM('Paid', 'Pending', 'Partial'), defaultValue: 'Paid' },
  sales_date: { type: DataTypes.DATEONLY, allowNull: false },
  sales_time: { type: DataTypes.TIME },
}, { tableName: 'sales' });
Sale.belongsTo(Branch, { foreignKey: 'branch_id' });
Sale.belongsTo(Produce, { foreignKey: 'produce_id' });
Sale.belongsTo(Buyer, { foreignKey: 'buyer_id' });
Sale.belongsTo(User, { foreignKey: 'sales_agent_id', as: 'agent' });

const CreditSale = sequelize.define('credit_sales', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyer_phone: { type: DataTypes.STRING(15) },
  buyer_location: { type: DataTypes.STRING(255) },
  national_id: { type: DataTypes.STRING(50) },
  tonnage: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  price_per_ton: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amount_due: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amount_paid: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  due_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('Pending', 'Partial', 'Paid', 'Overdue'), defaultValue: 'Pending' },
  sales_date: { type: DataTypes.DATEONLY, allowNull: false },
}, { tableName: 'credit_sales' });
CreditSale.belongsTo(Branch, { foreignKey: 'branch_id' });
CreditSale.belongsTo(Buyer, { foreignKey: 'buyer_id' });
CreditSale.belongsTo(Produce, { foreignKey: 'produce_id' });
CreditSale.belongsTo(User, { foreignKey: 'sales_agent_id', as: 'agent' });

const Payment = sequelize.define('payments', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  payment_date: { type: DataTypes.DATEONLY, allowNull: false },
  payment_method: { type: DataTypes.STRING(50) },
  notes: { type: DataTypes.TEXT },
}, { tableName: 'payments' });
Payment.belongsTo(CreditSale, { foreignKey: 'credit_sale_id' });
Payment.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

module.exports = {
  sequelize,
  Branch,
  User,
  Produce,
  Buyer,
  Dealer,
  Procurement,
  Stock,
  Sale,
  CreditSale,
  Payment,
};
