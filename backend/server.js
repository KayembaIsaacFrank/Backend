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


// Enforce unique manager per branch at DB level (run once, safe if already exists)
sequelize.query("ALTER TABLE users ADD UNIQUE unique_manager_per_branch (branch_id, role)").catch((err) => {
  if (err.original && err.original.code === 'ER_DUP_KEYNAME') {
    // Index already exists, ignore
    console.log('Unique index unique_manager_per_branch already exists.');
  } else if (err.original && err.original.code === 'ER_DUP_ENTRY') {
    console.error('Duplicate manager per branch exists! Please resolve manually:', err.message);
  } else if (err.original && err.original.code === 'ER_DUP_KEY') {
    console.error('Duplicate key error:', err.message);
  } else if (err.original && err.original.code === 'ER_ALREADY_EXISTS') {
    // Index already exists, ignore
    console.log('Unique index unique_manager_per_branch already exists.');
  } else {
    console.error('Error adding unique_manager_per_branch index:', err.message);
  }
});

app.get('/api/sales', (req, res) => {
  sequelize.query('SELECT * FROM sales ORDER BY date DESC', { order: [['date', 'DESC']] })
  .then(data => res.json(data))
  .catch(err => res.status(500).json({ error: err.message }));
});
