const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Procurement = sequelize.define('Procurement', {
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
  dealerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dealerContact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  branchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Branches',
      key: 'id',
    },
  },
  tonnage: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  date: {
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

module.exports = Procurement;
