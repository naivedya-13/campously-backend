const {
    getOrCreateWishlist,
    findWishlistItem,
    addWishlistItem,
    removeWishlistItem,
    getWishlistWithItems,
    findProductById,
} = require('./helper');

const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = parseInt(req.body.productId, 10);

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required.' });
        }

        const product = await findProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const wishlist = await getOrCreateWishlist(userId);
        const existingItem = await findWishlistItem(wishlist.id, productId);

        if (existingItem) {
            return res.status(200).json({ message: 'Product is already in your wishlist.' });
        }

        const item = await addWishlistItem({
            wishlistId: wishlist.id,
            productId,
        });

        res.status(201).json({ message: 'Added to wishlist.', item });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getWishlist = async (req, res) => {
    try {
        const wishlist = await getWishlistWithItems(req.user.id);

        if (!wishlist || wishlist.items.length === 0) {
            return res.status(200).json({ message: 'Your wishlist is empty.', items: [] });
        }

        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        await removeWishlistItem(itemId);
        res.status(200).json({ message: 'Item removed from wishlist.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
