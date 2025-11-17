const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Produce = sequelize.define('Produce', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.ENUM('beans', 'grain maize', 'cowpeas', 'groundnuts', 'rice', 'soybeans'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('beans', 'grain maize', 'cowpeas', 'groundnuts', 'rice', 'soybeans'),
    allowNull: false,
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Produce;
