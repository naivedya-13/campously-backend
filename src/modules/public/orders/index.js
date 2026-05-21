const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const {
    checkout,
    getMyOrders,
    getOrderById,
    getSellerOrders,
    updateOrderStatus,
} = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/checkout', checkout);
router.get('/seller', getSellerOrders);
router.get('/:id', getOrderById);
router.get('/', getMyOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
