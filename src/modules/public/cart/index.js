const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const { addToCart, getCart, updateCartItem, deleteCartItem } = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', deleteCartItem);

module.exports = router;
