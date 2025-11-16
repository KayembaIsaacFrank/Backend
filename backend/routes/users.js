const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole, authorizeBranch } = require('../middleware/auth');
const { listManagers, listAgents, listAgentsByBranch } = require('../controllers/usersController');

// CEO: list all managers
router.get('/managers', authenticateToken, authorizeRole('CEO'), listManagers);

// CEO: list all agents
router.get('/agents', authenticateToken, authorizeRole('CEO'), listAgents);

// CEO/Manager: list agents by branch (manager limited to own branch)
router.get('/agents/branch/:branchId', authenticateToken, authorizeRole('CEO', 'Manager'), authorizeBranch, listAgentsByBranch);

module.exports = router;
