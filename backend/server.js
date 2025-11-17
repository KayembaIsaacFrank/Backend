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
