const prisma = require('../../../config/prisma');

const findAllProducts = () =>
    prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            seller: { select: { id: true, name: true, email: true } },
        },
    });

const findProductById = (id) =>
    prisma.product.findUnique({
        where: { id },
        include: {
            seller: { select: { id: true, name: true, email: true } },
        },
    });

module.exports = { findAllProducts, findProductById };
