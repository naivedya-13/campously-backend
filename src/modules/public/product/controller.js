const {
    prisma,
    paginateProducts,
    findProductById,
    findRelatedProducts,
} = require('./helper');

const getAllProducts = async (req, res) => {
    try {
        const result = await paginateProducts(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchProducts = async (req, res) => {
    try {
        const q = req.query.q || '';
        if (q && req.user?.id) {
            await prisma.searchHistory.create({
                data: { userId: req.user.id, query: q },
            });
        }
        const result = await paginateProducts({ ...req.query, q });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFeatured = async (req, res) => {
    try {
        const { formatProduct, productInclude } = require('../../../utils/formatProduct');
        const products = await prisma.product.findMany({
            where: { isFeatured: true },
            include: require('../../../utils/formatProduct').productInclude,
            orderBy: { createdAt: 'desc' },
            take: parseInt(req.query.limit, 10) || 8,
        });
        res.json({ products: products.map(formatProduct) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTrending = async (req, res) => {
    try {
        const { formatProduct, productInclude } = require('../../../utils/formatProduct');
        const products = await prisma.product.findMany({
            where: { isTrending: true },
            include: productInclude,
            orderBy: { viewCount: 'desc' },
            take: parseInt(req.query.limit, 10) || 8,
        });
        res.json({ products: products.map(formatProduct) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const product = await findProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        await prisma.product.update({
            where: { id: productId },
            data: { viewCount: { increment: 1 } },
        });

        if (req.user?.id) {
            await prisma.recentlyViewed.upsert({
                where: {
                    userId_productId: {
                        userId: req.user.id,
                        productId,
                    },
                },
                create: { userId: req.user.id, productId },
                update: { viewedAt: new Date() },
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRelated = async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const products = await findRelatedProducts(productId);
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllProducts,
    searchProducts,
    getFeatured,
    getTrending,
    getProductById,
    getRelated,
};
