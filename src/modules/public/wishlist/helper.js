const prisma = require('../../../config/prisma');

const getOrCreateWishlist = async (userId) => {
    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
        wishlist = await prisma.wishlist.create({ data: { userId } });
    }
    return wishlist;
};

const findWishlistItem = (wishlistId, productId) =>
    prisma.wishlistItem.findUnique({
        where: { wishlistId_productId: { wishlistId, productId } },
    });

const addWishlistItem = (data) => prisma.wishlistItem.create({ data });

const removeWishlistItem = (id) => prisma.wishlistItem.delete({ where: { id } });

const getWishlistWithItems = (userId) =>
    prisma.wishlist.findUnique({
        where: { userId },
        include: {
            items: {
                include: { product: true },
            },
        },
    });

const findProductById = (id) => prisma.product.findUnique({ where: { id } });

module.exports = {
    getOrCreateWishlist,
    findWishlistItem,
    addWishlistItem,
    removeWishlistItem,
    getWishlistWithItems,
    findProductById,
};
