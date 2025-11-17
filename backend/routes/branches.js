const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { listBranches, getBranchById } = require('../controllers/branchesController');

// Get branches - PUBLIC for signup, authenticated users get filtered results
router.get('/', optionalAuth, listBranches);

// Get branch by ID (secured inside controller)
router.get('/:id', authenticateToken, getBranchById);

module.exports = router;
