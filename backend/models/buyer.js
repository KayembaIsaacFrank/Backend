const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Buyer = sequelize.define('Buyer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purchaseHistory: {
    type: DataTypes.JSON,
    allowNull: true, // Can be used to store an array of purchase records or references
  },
}, {
  timestamps: true,
});

module.exports = Buyer;
