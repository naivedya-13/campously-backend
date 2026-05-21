const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const {
    createProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
} = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/products', getMyProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
