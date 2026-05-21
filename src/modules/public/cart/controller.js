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
        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock.' });
        }

        const cart = await getOrCreateCart(userId);
        const existingItem = await findCartItem(cart.id, productId);

        if (existingItem) {
            await updateCartItemQuantity(
                existingItem.id,
                existingItem.quantity + quantity
            );
        } else {
            await addCartItem({ cartId: cart.id, productId, quantity });
        }

        const cartData = await getCartWithItems(userId);
        res.status(200).json({ message: 'Added to cart.', ...cartData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const cartData = await getCartWithItems(req.user.id);
        res.status(200).json(cartData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const itemId = parseInt(req.body.itemId || req.params.id, 10);
        const quantity = parseInt(req.body.quantity, 10);

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1.' });
        }

        await updateCartItemQuantity(itemId, quantity);
        const cartData = await getCartWithItems(req.user.id);
        res.status(200).json({ message: 'Cart updated.', ...cartData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const itemId = parseInt(req.params.id, 10);
        await removeCartItem(itemId);
        const cartData = await getCartWithItems(req.user.id);
        res.status(200).json({ message: 'Item removed.', ...cartData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.user.id);
        await require('../../../config/prisma').cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        res.status(200).json({ message: 'Cart cleared.', items: [], total: 0, itemCount: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addToCart, getCart, updateCartItem, deleteCartItem, clearCart };
