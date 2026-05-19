const express = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./product');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

module.exports = router;
