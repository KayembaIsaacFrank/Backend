const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const salesController = require('../controllers/salesController');

// Get all sales (optional branch filter)
router.get('/', authenticateToken, salesController.getSales);

// Create sale (decrements stock automatically)
router.post('/', authenticateToken, salesController.createSale);

// Get single sale (for receipt)
router.get('/:id', authenticateToken, salesController.getSaleById);

module.exports = router;
