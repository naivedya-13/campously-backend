const prisma = require('../../../config/prisma');
const { getCartWithItems, getOrCreateCart } = require('../cart/helper');
const { createNotification } = require('../../shared/notifications');
const crypto = require('crypto');

const formatOrder = (order) => ({
    id: order.id,
    status: order.status,
    total: order.total,
    transactionId: order.transactionId,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.price,
        image: i.product.images?.[0]?.url,
    })),
});

const checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartData = await getCartWithItems(userId);

        if (!cartData.items?.length) {
            return res.status(400).json({ error: 'Cart is empty.' });
        }

        for (const item of cartData.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${item.productName}.`,
                });
            }
        }

        const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        const order = await prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    userId,
                    total: cartData.total,
                    transactionId,
                    status: 'PENDING',
                    items: {
                        create: cartData.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: { include: { images: true, seller: true } },
                        },
                    },
                },
            });

            for (const item of cartData.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            const cart = await tx.cart.findUnique({ where: { userId } });
            if (cart) {
                await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            }

            return created;
        });

        const io = req.app.get('io');
        await createNotification(io, {
            userId,
            title: 'Order placed',
            message: `Your order #${order.id} was placed successfully.`,
            type: 'ORDER',
            link: `/orders`,
        });

        for (const item of order.items) {
            if (item.product.sellerId !== userId) {
                await createNotification(io, {
                    userId: item.product.sellerId,
                    title: 'New order received',
                    message: `You received an order for ${item.product.name}.`,
                    type: 'ORDER',
                    link: '/seller/orders',
                });
            }
        }

        res.status(201).json({
            message: 'Order placed successfully.',
            order: formatOrder(order),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: { product: { include: { images: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ orders: orders.map(formatOrder) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: parseInt(req.params.id, 10), userId: req.user.id },
            include: {
                items: { include: { product: { include: { images: true } } } },
            },
        });
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        res.json({ order: formatOrder(order) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const orderItems = await prisma.orderItem.findMany({
            where: { product: { sellerId } },
            include: {
                order: { include: { user: { select: { id: true, name: true, enrollmentId: true } } } },
                product: { include: { images: true } },
            },
            orderBy: { order: { createdAt: 'desc' } },
        });

        const ordersMap = new Map();
        for (const item of orderItems) {
            const o = item.order;
            if (!ordersMap.has(o.id)) {
                ordersMap.set(o.id, { ...o, items: [] });
            }
            ordersMap.get(o.id).items.push(item);
        }

        res.json({
            orders: Array.from(ordersMap.values()).map((o) => ({
                id: o.id,
                status: o.status,
                total: o.total,
                transactionId: o.transactionId,
                createdAt: o.createdAt,
                buyer: o.user,
                items: o.items.map((i) => ({
                    productName: i.product.name,
                    quantity: i.quantity,
                    price: i.price,
                })),
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const { status } = req.body;
        const valid = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!valid.includes(status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }

        const order = await prisma.order.findFirst({
            where: { id: orderId },
            include: { items: { include: { product: true } } },
        });
        if (!order) return res.status(404).json({ error: 'Order not found.' });

        const isSeller = order.items.some((i) => i.product.sellerId === req.user.id);
        if (!isSeller && order.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: { items: { include: { product: { include: { images: true } } } } },
        });

        const io = req.app.get('io');
        await createNotification(io, {
            userId: order.userId,
            title: 'Order updated',
            message: `Order #${order.id} is now ${status}.`,
            type: 'ORDER',
            link: `/orders`,
        });

        res.json({ message: 'Order updated.', order: formatOrder(updated) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    checkout,
    getMyOrders,
    getOrderById,
    getSellerOrders,
    updateOrderStatus,
};
