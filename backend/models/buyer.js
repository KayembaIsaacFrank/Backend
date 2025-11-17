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
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // purchaseHistory: {
  //   type: DataTypes.JSON,
  //   allowNull: true,
  // },
}, {
  timestamps: true,
});

module.exports = Buyer;
