const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const stockController = require('../controllers/stockController');

// Get stock for branch or all branches
router.get('/', authenticateToken, stockController.getStock);

module.exports = router;
