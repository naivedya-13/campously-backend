const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const { getWishlist, toggleWishlist, removeFromWishlist } = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/remove/:id', removeFromWishlist);

module.exports = router;
