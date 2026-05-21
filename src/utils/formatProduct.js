const { avatarUrl } = require('./avatar');

const conditionMap = {
    BRAND_NEW: 'brand-new',
    LIKE_NEW: 'like-new',
    GOOD: 'good',
    FAIR: 'fair',
};

const formatProduct = (product) => {
    const reviews = product.reviews || [];
    const avgRating =
        reviews.length > 0
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
            : product._avg?.rating || 0;

    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        condition: conditionMap[product.condition] || 'good',
        category: product.category?.slug || product.category?.name?.toLowerCase() || 'other',
        categoryId: product.categoryId,
        categoryName: product.category?.name,
        sellerId: product.sellerId,
        sellerName: product.seller?.name,
        sellerAvatar: product.seller?.avatar || avatarUrl(product.seller?.enrollmentId),
        sellerVerified: product.seller?.isVerified ?? false,
        rating: Math.round(avgRating * 10) / 10,
        reviews: reviews.length || product._count?.reviews || 0,
        images: (product.images || []).sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.url),
        location: product.location || product.seller?.college || 'On Campus',
        tags: product.tags ? product.tags.split(',').map((t) => t.trim()) : [],
        isFeatured: product.isFeatured,
        isTrending: product.isTrending,
        postedDate: product.createdAt,
        createdAt: product.createdAt,
    };
};

const productInclude = {
    category: true,
    images: { orderBy: { sortOrder: 'asc' } },
    seller: {
        select: {
            id: true,
            name: true,
            enrollmentId: true,
            avatar: true,
            college: true,
            isVerified: true,
        },
    },
    reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, avatar: true, enrollmentId: true } },
        },
    },
    _count: { select: { reviews: true } },
};

module.exports = { formatProduct, productInclude, conditionMap };
