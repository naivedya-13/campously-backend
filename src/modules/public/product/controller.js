const { findAllProducts, findProductById } = require('./helper');

const getAllProducts = async (req, res) => {
    try {
        const products = await findAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const product = await findProductById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllProducts, getProductById };
