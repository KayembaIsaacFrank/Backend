
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const reportsController = require('../controllers/reportsController');
// Procurement export endpoints
router.get('/procurement/csv', authenticateToken, reportsController.exportProcurementCsv);
router.get('/procurement/xlsx', authenticateToken, reportsController.exportProcurementXlsx);
router.get('/procurement/pdf', authenticateToken, reportsController.exportProcurementPdf);

// Export sales report as CSV
router.get('/sales/csv', authenticateToken, reportsController.exportSalesCsv);

// Export sales report as Excel (XLSX)
router.get('/sales/xlsx', authenticateToken, reportsController.exportSalesXlsx);

// Export sales report as PDF
router.get('/sales/pdf', authenticateToken, reportsController.exportSalesPdf);

module.exports = router;
