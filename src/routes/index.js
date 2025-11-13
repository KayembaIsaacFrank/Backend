const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const saleRoutes = require('./saleRoutes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);

module.exports = router;