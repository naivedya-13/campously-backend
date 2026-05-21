const express = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./product');
const cartRoutes = require('./cart');
const wishlistRoutes = require('./wishlist');
const chatRoutes = require('./chat');
const orderRoutes = require('./orders');
const homeRoutes = require('./home');
const dashboardRoutes = require('./dashboard');
const userRoutes = require('./users');
const notificationRoutes = require('./notifications');
const sellerRoutes = require('./seller');
const uploadRoutes = require('./upload');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/home', homeRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/seller', sellerRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
