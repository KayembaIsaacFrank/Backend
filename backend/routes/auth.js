const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { changePassword } = require('../controllers/changePasswordController');

// Public routes
router.post('/ceo-signup', authController.ceoSignup);
router.post('/manager-signup', authController.managerSignup);
router.post('/agent-signup', authController.agentSignup);
router.post('/login', authController.login);

// Protected routes
router.post('/create-manager', authenticateToken, authorizeRole('CEO'), authController.createManager);
router.post('/create-agent', authenticateToken, authorizeRole('Manager'), authController.createSalesAgent);

// Change password for all authenticated users (User and Buyer)
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;
