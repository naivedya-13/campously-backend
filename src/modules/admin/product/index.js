const express = require('express');
const adminMiddleware = require('../../../middleware/adminMiddleware');
const { addProduct, getMyProducts, editProduct, removeProduct } = require('./controller');

const router = express.Router();

router.use(adminMiddleware);

router.post('/', addProduct);
router.get('/mine', getMyProducts);
router.put('/:id', editProduct);
router.delete('/:id', removeProduct);

module.exports = router;
