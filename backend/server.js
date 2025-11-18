/**
 * Main Server File - Golden Crop Distributors Ltd Backend
 * 
 * Purpose: Entry point for the Express.js backend server
 * - Configures middleware (security, CORS, JSON parsing)
 * - Defines API routes for authentication, users, branches, produce, procurement, sales, etc.
 * - Establishes database connection using Sequelize ORM
 * - Handles server startup and error handling
 * - Removes legacy unique constraints that prevented multiple sales agents per branch
 * 
 * Dependencies:
 * - express: Web application framework
 * - cors: Cross-Origin Resource Sharing middleware
 * - helmet: Security middleware for setting HTTP headers
 * - sequelize: ORM for MySQL database operations
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();

// Middleware - Applied to all incoming requests
app.use(helmet());           // Adds security headers to HTTP responses
app.use(cors());             // Enables Cross-Origin Resource Sharing for frontend communication
app.use(express.json());     // Parses incoming JSON request bodies

// API Routes - Maps URL endpoints to route handlers
app.use('/api/auth', require('./routes/auth'));               // Authentication: login, signup, create users
app.use('/api/users', require('./routes/users'));             // User management: get, update, delete users
app.use('/api/branches', require('./routes/branches'));       // Branch operations: list branches
app.use('/api/produce', require('./routes/produce'));         // Produce types: list available produce
app.use('/api/procurement', require('./routes/procurement')); // Procurement: record stock purchases
app.use('/api/sales', require('./routes/sales'));             // Sales: record cash and credit sales
app.use('/api/credit-sales', require('./routes/creditSales'));// Credit sales: manage credit transactions
app.use('/api/stock', require('./routes/stock'));             // Stock: view current inventory levels
app.use('/api/buyers', require('./routes/buyers'));           // Buyers: manage customer database
app.use('/api/analytics', require('./routes/analytics'));     // Analytics: business intelligence and KPIs
app.use('/api/reports', require('./routes/reports'));         // Reports: generate PDF and Excel reports

// Error handling middleware - Catches all errors from route handlers
app.use((err, req, res, next) => {
  console.error(err.stack);  // Log error details to console
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;  // Use PORT from .env or default to 5000

// Database connection and server startup
sequelize
  .authenticate()  // Test database connection
  .then(() => {
    console.log('Database connection established');
    // Sync Sequelize models with database schema
    // alter:true updates existing tables without dropping data
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    // Start Express server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Sequelize initialization failed:', err);
    process.exit(1);  // Exit process if database connection fails
  });


/**
 * Legacy Constraint Cleanup
 * 
 * Purpose: Remove the unique_manager_per_branch constraint that was incorrectly
 * preventing multiple sales agents from being assigned to the same branch.
 * 
 * Background:
 * - Original constraint: UNIQUE(branch_id, role)
 * - Problem: Prevented ANY duplicate (branch_id, role) combinations
 * - Impact: Blocked having 2 sales agents per branch (business requirement)
 * 
 * Solution:
 * - Query information_schema to check if constraint exists
 * - Drop the constraint if found
 * - Business rule (1 manager per branch) is now enforced in application code
 * - Allows system to support up to 2 sales agents per branch
 */
sequelize.query(`
  SELECT CONSTRAINT_NAME 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE TABLE_NAME = 'users' 
  AND TABLE_SCHEMA = DATABASE()
  AND CONSTRAINT_NAME = 'unique_manager_per_branch'
`).then(([results]) => {
  if (results.length > 0) {
    // Constraint exists, drop it to allow multiple sales agents per branch
    return sequelize.query("ALTER TABLE users DROP INDEX unique_manager_per_branch");
  }
}).catch((err) => {
  // Silently handle errors - constraint may already be removed
  console.log('Unique constraint cleanup:', err.original ? err.original.code : 'processed');
});

// Note: One manager per branch is now enforced in application logic only (authController)
// This allows 2 sales agents per branch while preventing duplicate managers

// Direct sales query endpoint (consider moving to routes/sales.js)
app.get('/api/sales', (req, res) => {
  sequelize.query('SELECT * FROM sales ORDER BY date DESC', { order: [['date', 'DESC']] })
  .then(data => res.json(data))       // Return sales data as JSON
  .catch(err => res.status(500).json({ error: err.message }));
});
