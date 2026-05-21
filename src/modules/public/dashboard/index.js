const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const { getBuyerDashboard, getSellerDashboard } = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/buyer', getBuyerDashboard);
router.get('/seller', getSellerDashboard);

module.exports = router;
