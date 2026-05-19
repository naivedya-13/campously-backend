const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const { addToWishlist, getWishlist, removeFromWishlist } = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', addToWishlist);
router.get('/', getWishlist);
router.delete('/:itemId', removeFromWishlist);

module.exports = router;
