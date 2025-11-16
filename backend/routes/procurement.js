const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const procurementController = require('../controllers/procurementController');

// Get all procurements (with optional branch filter)
router.get('/', authenticateToken, procurementController.getProcurements);

// Create procurement (increments stock automatically)
router.post('/', authenticateToken, procurementController.createProcurement);

module.exports = router;
