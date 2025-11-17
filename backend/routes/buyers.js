const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const buyersController = require('../controllers/buyersController');
const buyerAuthController = require('../controllers/buyerAuthController');

// Get all buyers (optionally by branch)
router.get('/', authenticateToken, buyersController.getBuyers);

// Create buyer
router.post('/', authenticateToken, buyersController.createBuyer);

// Public buyer signup
router.post('/signup', buyerAuthController.buyerSignup);

module.exports = router;
