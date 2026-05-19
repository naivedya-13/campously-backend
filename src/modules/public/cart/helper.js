const prisma = require('../../../config/prisma');

const getOrCreateCart = async (userId) => {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
    }
    return cart;
};

const findCartItem = (cartId, productId) =>
    prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId, productId } },
    });

const addCartItem = (data) => prisma.cartItem.create({ data });

const updateCartItemQuantity = (id, quantity) =>
    prisma.cartItem.update({ where: { id }, data: { quantity } });

const removeCartItem = (id) => prisma.cartItem.delete({ where: { id } });

const getCartWithItems = (userId) =>
    prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: { product: true },
            },
        },
    });

const findProductById = (id) => prisma.product.findUnique({ where: { id } });

module.exports = {
    getOrCreateCart,
    findCartItem,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    getCartWithItems,
    findProductById,
};
