const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { listBranches, getBranchById } = require('../controllers/branchesController');

// Get branches (CEO sees all; others see their own)
router.get('/', authenticateToken, listBranches);

// Get branch by ID (secured inside controller)
router.get('/:id', authenticateToken, getBranchById);

module.exports = router;
