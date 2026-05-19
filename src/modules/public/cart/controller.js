const {
    getOrCreateCart,
    findCartItem,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    getCartWithItems,
    findProductById,
} = require('./helper');

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = parseInt(req.body.productId, 10);
        const quantity = parseInt(req.body.quantity, 10) || 1;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required.' });
        }

        const product = await findProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const cart = await getOrCreateCart(userId);
        const existingItem = await findCartItem(cart.id, productId);

        if (existingItem) {
            const item = await updateCartItemQuantity(
                existingItem.id,
                existingItem.quantity + quantity
            );
            return res.status(200).json({ message: 'Cart quantity updated.', item });
        }

        const item = await addCartItem({
            cartId: cart.id,
            productId,
            quantity,
        });

        res.status(201).json({ message: 'Added to cart.', item });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const cart = await getCartWithItems(req.user.id);

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({ message: 'Your cart is empty.', items: [] });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const quantity = parseInt(req.body.quantity, 10);

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1.' });
        }

        const item = await updateCartItemQuantity(itemId, quantity);
        res.status(200).json({ message: 'Cart item updated.', item });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        await removeCartItem(itemId);
        res.status(200).json({ message: 'Item removed from cart.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addToCart, getCart, updateCartItem, deleteCartItem };
