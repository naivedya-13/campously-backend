const prisma = require('../../../config/prisma');
const { formatProduct, productInclude } = require('../../../utils/formatProduct');

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            originalPrice,
            stock,
            categoryId,
            condition,
            location,
            tags,
            images,
            isFeatured,
            isTrending,
        } = req.body;

        if (!name || price === undefined || !categoryId) {
            return res.status(400).json({ error: 'Name, price, and category are required.' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || '',
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                stock: parseInt(stock, 10) || 0,
                categoryId: parseInt(categoryId, 10),
                sellerId: req.user.id,
                condition: condition || 'GOOD',
                location,
                tags,
                isFeatured: !!isFeatured,
                isTrending: !!isTrending,
                images: {
                    create: (images || []).map((url, i) => ({
                        url,
                        sortOrder: i,
                    })),
                },
            },
            include: productInclude,
        });

        res.status(201).json({
            message: 'Product listed successfully.',
            product: formatProduct(product),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { sellerId: req.user.id },
            include: productInclude,
            orderBy: { createdAt: 'desc' },
        });
        res.json({ products: products.map(formatProduct) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { name, description, price, stock, condition, location, tags } = req.body;
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(stock !== undefined && { stock: parseInt(stock, 10) }),
                ...(condition && { condition }),
                ...(location !== undefined && { location }),
                ...(tags !== undefined && { tags }),
            },
            include: productInclude,
        });

        res.json({ message: 'Product updated.', product: formatProduct(product) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized.' });
        }
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createProduct, getMyProducts, updateProduct, deleteProduct };
