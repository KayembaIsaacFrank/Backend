/**
 * Database Connection Pool - MySQL
 * 
 * Purpose: Creates a connection pool for direct MySQL queries (used alongside Sequelize)
 * - Provides raw SQL query capability when ORM is not suitable
 * - Manages connection pooling for better performance
 * - Uses environment variables for database credentials
 * 
 * Configuration:
 * - waitForConnections: Queue requests when all connections are in use
 * - connectionLimit: Maximum of 10 simultaneous connections
 * - queueLimit: No limit on queued connection requests
 * 
 * Note: This is used for legacy/raw SQL queries. Most operations use Sequelize ORM.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();  // Load environment variables from .env file

// Create connection pool with configuration from environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,           // Database server address
  user: process.env.DB_USER,           // Database username
  password: process.env.DB_PASSWORD,   // Database password
  database: process.env.DB_NAME,       // Database name
  waitForConnections: true,            // Queue requests when pool is full
  connectionLimit: 10,                 // Maximum concurrent connections
  queueLimit: 0,                       // Unlimited queue size
});

module.exports = pool;
