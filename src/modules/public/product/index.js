const express = require('express');
const optionalAuth = require('../../../middleware/optionalAuth');
const {
    getAllProducts,
    searchProducts,
    getFeatured,
    getTrending,
    getProductById,
    getRelated,
} = require('./controller');

const router = express.Router();

router.get('/search', optionalAuth, searchProducts);
router.get('/featured', getFeatured);
router.get('/trending', getTrending);
router.get('/related/:id', getRelated);
router.get('/:id', optionalAuth, getProductById);
router.get('/', getAllProducts);

module.exports = router;
