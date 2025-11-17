const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  produceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Produces',
      key: 'id',
    },
  },
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Buyers',
      key: 'id',
    },
  },
  salesAgentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  tonnage: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  sales_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Sale;
