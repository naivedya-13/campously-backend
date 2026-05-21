const prisma = require('../../../config/prisma');
const { formatProduct, productInclude } = require('../../../utils/formatProduct');

const buildWhere = (query) => {
    const where = {};

    if (query.category) {
        where.category = { slug: query.category };
    }
    if (query.condition) {
        const map = {
            'brand-new': 'BRAND_NEW',
            'like-new': 'LIKE_NEW',
            good: 'GOOD',
            fair: 'FAIR',
        };
        where.condition = map[query.condition] || query.condition;
    }
    if (query.minPrice || query.maxPrice) {
        where.price = {};
        if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
        if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }
    if (query.sellerId) {
        where.sellerId = parseInt(query.sellerId, 10);
    }
    if (query.rating) {
        // filtered post-query for avg rating
    }
    if (query.q) {
        where.OR = [
            { name: { contains: query.q } },
            { description: { contains: query.q } },
            { tags: { contains: query.q } },
            { seller: { name: { contains: query.q } } },
            { category: { name: { contains: query.q } } },
        ];
    }

    return where;
};

const buildOrderBy = (sortBy) => {
    switch (sortBy) {
        case 'price-low':
            return { price: 'asc' };
        case 'price-high':
            return { price: 'desc' };
        case 'rating':
            return { viewCount: 'desc' };
        case 'trending':
            return [{ isTrending: 'desc' }, { viewCount: 'desc' }];
        default:
            return { createdAt: 'desc' };
    }
};

const paginateProducts = async (query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const where = buildWhere(query);

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: productInclude,
            orderBy: buildOrderBy(query.sortBy),
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products: products.map(formatProduct),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + products.length < total,
        },
    };
};

const findProductById = async (id, includeReviews = true) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            ...productInclude,
            reviews: includeReviews
                ? {
                      orderBy: { createdAt: 'desc' },
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
                  }
                : false,
        },
    });
    if (!product) return null;
    const formatted = formatProduct(product);
    formatted.reviewList = (product.reviews || []).map((r) => ({
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        userName: r.user.name,
        userAvatar: r.user.avatar,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
    }));
    return formatted;
};

const findRelatedProducts = async (productId, limit = 4) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true, price: true, tags: true },
    });
    if (!product) return [];

    const priceMin = product.price * 0.7;
    const priceMax = product.price * 1.3;

    const related = await prisma.product.findMany({
        where: {
            id: { not: productId },
            OR: [
                { categoryId: product.categoryId },
                { price: { gte: priceMin, lte: priceMax } },
                { isTrending: true },
            ],
        },
        include: productInclude,
        orderBy: [{ isTrending: 'desc' }, { viewCount: 'desc' }],
        take: limit,
    });

    return related.map(formatProduct);
};

module.exports = {
    prisma,
    paginateProducts,
    findProductById,
    findRelatedProducts,
    formatProduct,
    productInclude,
};
