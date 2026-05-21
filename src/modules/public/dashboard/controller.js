const prisma = require('../../../config/prisma');
const { getCartWithItems } = require('../cart/helper');
const { getWishlistWithItems } = require('../wishlist/helper');
const { formatProduct, productInclude } = require('../../../utils/formatProduct');
const { avatarUrl } = require('../../../utils/avatar');

const getBuyerDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const [cart, wishlist, orders, notifications, recentChats, recentlyViewed] =
            await Promise.all([
                getCartWithItems(userId),
                getWishlistWithItems(userId),
                prisma.order.findMany({
                    where: { userId },
                    include: {
                        items: { include: { product: { include: { images: true } } } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                }),
                prisma.notification.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                prisma.conversation.findMany({
                    where: { participants: { some: { userId } } },
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatar: true,
                                        enrollmentId: true,
                                    },
                                },
                            },
                        },
                        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 5,
                }),
                prisma.recentlyViewed.findMany({
                    where: { userId },
                    include: { product: { include: productInclude } },
                    orderBy: { viewedAt: 'desc' },
                    take: 6,
                }),
            ]);

        const totalSpent = await prisma.order.aggregate({
            where: { userId, status: { not: 'CANCELLED' } },
            _sum: { total: true },
        });

        res.json({
            cartCount: cart.itemCount,
            cartTotal: cart.total,
            wishlistCount: wishlist.itemCount,
            orderCount: await prisma.order.count({ where: { userId } }),
            totalSpent: totalSpent._sum.total || 0,
            recentOrders: orders.map((o) => ({
                id: o.id,
                status: o.status,
                total: o.total,
                createdAt: o.createdAt,
                product:
                    o.items[0]?.product?.name || 'Multiple items',
            })),
            notifications,
            recentChats: recentChats.map((c) => {
                const other = c.participants.find((p) => p.userId !== userId);
                const last = c.messages[0];
                return {
                    id: c.id,
                    participantName: other?.user?.name,
                    participantAvatar:
                        other?.user?.avatar ||
                        avatarUrl(other?.user?.enrollmentId),
                    lastMessage: last?.content,
                    lastMessageTime: last?.createdAt || c.updatedAt,
                };
            }),
            recentlyViewed: recentlyViewed.map((r) => formatProduct(r.product)),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSellerDashboard = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const products = await prisma.product.findMany({
            where: { sellerId },
            include: { _count: { select: { reviews: true, orderItems: true } } },
        });

        const orderItems = await prisma.orderItem.findMany({
            where: { product: { sellerId } },
            include: { order: true, product: true },
        });

        const earnings = orderItems
            .filter((i) => !['CANCELLED'].includes(i.order.status))
            .reduce((s, i) => s + i.price * i.quantity, 0);

        const topProducts = await prisma.product.findMany({
            where: { sellerId },
            include: productInclude,
            orderBy: { viewCount: 'desc' },
            take: 5,
        });

        res.json({
            totalListings: products.length,
            totalSales: orderItems.length,
            totalEarnings: earnings,
            activeOrders: orderItems.filter((i) =>
                ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(i.order.status)
            ).length,
            topProducts: topProducts.map(formatProduct),
            recentBuyers: orderItems.slice(0, 5).map((i) => ({
                productName: i.product.name,
                quantity: i.quantity,
                price: i.price,
                orderId: i.orderId,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getBuyerDashboard, getSellerDashboard };
