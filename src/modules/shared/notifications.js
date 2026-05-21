const prisma = require('../../config/prisma');

const createNotification = async (io, { userId, title, message, type = 'SYSTEM', link }) => {
    const notification = await prisma.notification.create({
        data: { userId, title, message, type, link },
    });

    if (io) {
        io.to(`user:${userId}`).emit('notification', {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            link: notification.link,
            read: false,
            createdAt: notification.createdAt,
        });
    }

    return notification;
};

module.exports = { createNotification };
