const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts } = require('../controllers/productController');

// List ke mutabik endpoints:
router.post('/', createProduct); // POST /api/products
router.get('/', getAllProducts);  // GET /api/products

module.exports = router;