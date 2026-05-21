const prisma = require('../../../config/prisma');
const { formatProduct, productInclude } = require('../../../utils/formatProduct');

const getHome = async (req, res) => {
    try {
        const [featured, trending, latest, categories, banners, testimonials, stats] =
            await Promise.all([
                prisma.product.findMany({
                    where: { isFeatured: true },
                    include: productInclude,
                    take: 8,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.product.findMany({
                    where: { isTrending: true },
                    include: productInclude,
                    take: 8,
                    orderBy: { viewCount: 'desc' },
                }),
                prisma.product.findMany({
                    include: productInclude,
                    take: 8,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.category.findMany({ orderBy: { name: 'asc' } }),
                prisma.banner.findMany({
                    where: { active: true },
                    orderBy: { sortOrder: 'asc' },
                }),
                prisma.testimonial.findMany({
                    where: { active: true },
                    take: 6,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.platformStat.findMany(),
            ]);

        const statMap = stats.reduce((acc, s) => {
            acc[s.key] = { value: s.value, label: s.label };
            return acc;
        }, {});

        res.json({
            featured: featured.map(formatProduct),
            trending: trending.map(formatProduct),
            latest: latest.map(formatProduct),
            categories,
            banners,
            testimonials,
            stats: statMap,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTestimonials = async (req, res) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ testimonials });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getHome, getTestimonials, getCategories };
