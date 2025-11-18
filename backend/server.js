const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/produce', require('./routes/produce'));
app.use('/api/procurement', require('./routes/procurement'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/credit-sales', require('./routes/creditSales'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established');
    // Use alter:true to sync models and update tables without data loss
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Sequelize initialization failed:', err);
    process.exit(1);
  });


// Remove the old incorrect unique constraint that prevented multiple sales agents per branch
// First, we need to find and drop the constraint properly
sequelize.query(`
  SELECT CONSTRAINT_NAME 
  FROM information_schema.TABLE_CONSTRAINTS 
  WHERE TABLE_NAME = 'users' 
  AND TABLE_SCHEMA = DATABASE()
  AND CONSTRAINT_NAME = 'unique_manager_per_branch'
`).then(([results]) => {
  if (results.length > 0) {
    // Constraint exists, drop it
    return sequelize.query("ALTER TABLE users DROP INDEX unique_manager_per_branch");
  }
}).catch((err) => {
  // Ignore errors - index might not exist or already removed
  console.log('Unique constraint cleanup:', err.original ? err.original.code : 'processed');
});

// Note: One manager per branch is now enforced in application logic only (authController)
// This allows 2 sales agents per branch while preventing duplicate managers

app.get('/api/sales', (req, res) => {
  sequelize.query('SELECT * FROM sales ORDER BY date DESC', { order: [['date', 'DESC']] })
  .then(data => res.json(data))
  .catch(err => res.status(500).json({ error: err.message }));
});
