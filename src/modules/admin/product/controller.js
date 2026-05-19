const {
    createProduct,
    updateProduct,
    deleteProduct,
    findProductById,
    findProductsBySeller,
} = require('./helper');

const addProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const sellerId = req.user.id;

        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Name and price are required.' });
        }

        const product = await createProduct({
            name,
            description: description || '',
            price: parseFloat(price),
            stock: parseInt(stock, 10) || 0,
            sellerId,
        });

        res.status(201).json({ message: 'Product created successfully.', product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const products = await findProductsBySeller(req.user.id);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const existing = await findProductById(productId);

        if (!existing) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        if (existing.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own products.' });
        }

        const { name, description, price, stock } = req.body;
        const product = await updateProduct(productId, {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(price !== undefined && { price: parseFloat(price) }),
            ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        });

        res.status(200).json({ message: 'Product updated successfully.', product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const existing = await findProductById(productId);

        if (!existing) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        if (existing.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own products.' });
        }

        await deleteProduct(productId);
        res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addProduct, getMyProducts, editProduct, removeProduct };
