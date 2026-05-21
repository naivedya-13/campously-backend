const prisma = require('../../../config/prisma');

const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const unreadCount = await prisma.notification.count({
            where: { userId: req.user.id, read: false },
        });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { id: parseInt(req.params.id, 10), userId: req.user.id },
            data: { read: true },
        });
        res.json({ message: 'Notification marked as read.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, read: false },
            data: { read: true },
        });
        res.json({ message: 'All notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getNotifications, markRead, markAllRead };
