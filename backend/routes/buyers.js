const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const buyersController = require('../controllers/buyersController');

// Get all buyers (optionally by branch)
router.get('/', authenticateToken, buyersController.getBuyers);

// Create buyer
router.post('/', authenticateToken, buyersController.createBuyer);

module.exports = router;
