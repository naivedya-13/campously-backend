const express = require('express');
const router = express.Router();
const { addToCart, getCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware'); // Security guard middleware

// Both endpoints are protected by authMiddleware to verify the JWT token
router.post('/', authMiddleware, addToCart); // POST /api/cart
router.get('/', authMiddleware, getCart);   // GET /api/cart

module.exports = router;