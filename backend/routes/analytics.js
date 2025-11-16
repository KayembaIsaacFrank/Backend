const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// Generic KPIs (branch scoped automatically for non-CEO)
router.get('/', authenticateToken, analyticsController.getKpis);

// CEO: Multi-branch overview
router.get('/branches-overview', authenticateToken, analyticsController.getBranchesOverview);

// CEO: Top produce performance
router.get('/top-produce', authenticateToken, analyticsController.getTopProduce);

// Manager: Agent performance
router.get('/agents-performance', authenticateToken, analyticsController.getAgentsPerformance);
// Sales trend
router.get('/sales-trend', authenticateToken, analyticsController.getSalesTrend);
// Produce breakdown
router.get('/produce-breakdown', authenticateToken, analyticsController.getProduceBreakdown);

module.exports = router;
