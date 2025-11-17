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

// CEO: remove (deactivate) a manager by user ID
const { deleteManager } = require('../controllers/usersController');
router.delete('/managers/:id', authenticateToken, authorizeRole('CEO'), deleteManager);

// CEO/Manager: remove (deactivate) a sales agent by user ID (manager limited to their branch)
const { deleteSalesAgent } = require('../controllers/usersController');
router.delete('/agents/:id', authenticateToken, authorizeRole('CEO', 'Manager'), deleteSalesAgent);

module.exports = router;
