const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  produce_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'produce_id',
    references: {
      model: 'produce',
      key: 'id',
    },
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'branch_id',
    references: {
      model: 'branches',
      key: 'id',
    },
  },
  current_tonnage: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'current_tonnage',
    defaultValue: 0.00,
  },
}, {
  tableName: 'stock',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Stock;
