const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes
router.post('/ceo-signup', authController.ceoSignup);
router.post('/login', authController.login);

// Protected routes
router.post('/create-manager', authenticateToken, authorizeRole('CEO'), authController.createManager);
router.post('/create-agent', authenticateToken, authorizeRole('Manager'), authController.createSalesAgent);

module.exports = router;
