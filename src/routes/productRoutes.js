const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', authMiddleware.isAdmin, productController.createProduct);
router.put('/:id', authMiddleware.isAdmin, productController.updateProduct);
router.delete('/:id', authMiddleware.isAdmin, productController.deleteProduct);

module.exports = router;