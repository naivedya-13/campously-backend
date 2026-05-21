const prisma = require('../../../config/prisma');
const { formatProduct, productInclude } = require('../../../utils/formatProduct');

const getOrCreateCart = async (userId) => {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
    }
    return cart;
};

const formatCartResponse = (cart) => {
    if (!cart?.items?.length) {
        return { items: [], total: 0, itemCount: 0 };
    }

    const items = cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: formatProduct(item.product),
        productName: item.product.name,
        price: item.product.price,
        image: item.product.images?.[0]?.url || '',
    }));

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    return {
        id: cart.id,
        items,
        total,
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
    };
};

const getCartWithItems = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: { include: productInclude },
                },
            },
        },
    });
    return formatCartResponse(cart);
};

const findCartItem = (cartId, productId) =>
    prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId, productId } },
    });

const addCartItem = (data) => prisma.cartItem.create({ data });

const updateCartItemQuantity = (id, quantity) =>
    prisma.cartItem.update({ where: { id }, data: { quantity } });

const removeCartItem = (id) => prisma.cartItem.delete({ where: { id } });

const findProductById = (id) => prisma.product.findUnique({ where: { id } });

module.exports = {
    getOrCreateCart,
    getCartWithItems,
    findCartItem,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    findProductById,
    formatCartResponse,
};
