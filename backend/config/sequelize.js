const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sanitize DB name to handle quotes/backticks in .env (e.g., "golden crop")
const dbName = (process.env.DB_NAME || '').replace(/[`"']/g, '');

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

module.exports = sequelize;
