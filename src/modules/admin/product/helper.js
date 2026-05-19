const prisma = require('../../../config/prisma');

const createProduct = (data) => prisma.product.create({ data });

const updateProduct = (id, data) =>
    prisma.product.update({ where: { id }, data });

const deleteProduct = (id) => prisma.product.delete({ where: { id } });

const findProductById = (id) => prisma.product.findUnique({ where: { id } });

const findProductsBySeller = (sellerId) =>
    prisma.product.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
    });

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    findProductById,
    findProductsBySeller,
};
