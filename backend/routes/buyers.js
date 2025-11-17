const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const buyersController = require('../controllers/buyersController');

// Only sales agents can get or create buyers, and only their own
router.get('/', authenticateToken, buyersController.getBuyers);
router.post('/', authenticateToken, buyersController.createBuyer);

// Removed public buyer signup route

module.exports = router;
