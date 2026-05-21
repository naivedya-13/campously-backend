const prisma = require('../../../config/prisma');
const { getOrCreateWishlist, getWishlistWithItems } = require('./helper');
const { createNotification } = require('../../shared/notifications');

const getWishlist = async (req, res) => {
    try {
        const data = await getWishlistWithItems(req.user.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleWishlist = async (req, res) => {
    try {
        const productId = parseInt(req.body.productId, 10);
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required.' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const wishlist = await getOrCreateWishlist(req.user.id);
        const existing = await prisma.wishlistItem.findUnique({
            where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
        });

        let added = false;
        if (existing) {
            await prisma.wishlistItem.delete({ where: { id: existing.id } });
        } else {
            await prisma.wishlistItem.create({
                data: { wishlistId: wishlist.id, productId },
            });
            added = true;
            const io = req.app.get('io');
            await createNotification(io, {
                userId: req.user.id,
                title: 'Saved to wishlist',
                message: `${product.name} was added to your wishlist.`,
                type: 'WISHLIST',
                link: '/wishlist',
            });
        }

        const data = await getWishlistWithItems(req.user.id);
        res.json({ added, removed: !added, ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const wishlist = await getOrCreateWishlist(req.user.id);
        await prisma.wishlistItem.deleteMany({
            where: { wishlistId: wishlist.id, productId },
        });
        const data = await getWishlistWithItems(req.user.id);
        res.json({ message: 'Removed from wishlist.', ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getWishlist, toggleWishlist, removeFromWishlist };
