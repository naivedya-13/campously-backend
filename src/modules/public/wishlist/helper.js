const prisma = require('../../../config/prisma');
const { formatProduct, productInclude } = require('../../../utils/formatProduct');

const getOrCreateWishlist = async (userId) => {
    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
        wishlist = await prisma.wishlist.create({ data: { userId } });
    }
    return wishlist;
};

const getWishlistWithItems = async (userId) => {
    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
            items: {
                include: { product: { include: productInclude } },
            },
        },
    });

    const items = (wishlist?.items || []).map((item) => formatProduct(item.product));
    return { items, itemCount: items.length };
};

module.exports = { getOrCreateWishlist, getWishlistWithItems, formatProduct };
