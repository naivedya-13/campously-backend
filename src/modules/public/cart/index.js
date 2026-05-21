const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const {
    addToCart,
    getCart,
    updateCartItem,
    deleteCartItem,
    clearCart,
} = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/update', updateCartItem);
router.delete('/remove/:id', deleteCartItem);
router.delete('/clear', clearCart);

module.exports = router;
