const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { listProduce } = require('../controllers/produceController');

// Get all produce types
router.get('/', authenticateToken, listProduce);

module.exports = router;
