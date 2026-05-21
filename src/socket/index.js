const jwt = require('jsonwebtoken');
const {
    prisma,
    getConversationForUser,
    formatConversation,
    formatMessage,
} = require('../modules/public/chat/helper');

const { jwtSecret } = require('../config/env');

const onlineUsers = new Map();

const setupSocket = (io, app) => {
    app.set('getOnlineUserIds', () => new Set(onlineUsers.keys()));

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jwt.verify(token, jwtSecret);
            socket.userId = decoded.id;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        onlineUsers.set(userId, socket.id);
        socket.join(`user:${userId}`);

        io.emit('user_online', { userId });

        socket.on('join_conversation', async (conversationId) => {
            const id = parseInt(conversationId, 10);
            const conversation = await getConversationForUser(id, userId);
            if (conversation) {
                socket.join(`conversation:${id}`);
            }
        });

        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        socket.on('send_message', async (payload, callback) => {
            try {
                const conversationId = parseInt(payload.conversationId, 10);
                const content = (payload.content || '').trim();

                if (!content) {
                    return callback?.({ error: 'Message content is required.' });
                }

                const conversation = await getConversationForUser(
                    conversationId,
                    userId
                );
                if (!conversation) {
                    return callback?.({ error: 'Conversation not found.' });
                }

                const message = await prisma.message.create({
                    data: {
                        conversationId,
                        senderId: userId,
                        content,
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true, enrollmentId: true },
                        },
                    },
                });

                await prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() },
                });

                const formatted = formatMessage(message);

                io.to(`conversation:${conversationId}`).emit(
                    'new_message',
                    formatted
                );

                const otherParticipant = conversation.participants.find(
                    (p) => p.userId !== userId
                );
                if (otherParticipant) {
                    const fullConvo = await prisma.conversation.findUnique({
                        where: { id: conversationId },
                        include: {
                            participants: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            enrollmentId: true,
                                            avatar: true,
                                        },
                                    },
                                },
                            },
                            messages: {
                                orderBy: { createdAt: 'desc' },
                                take: 1,
                            },
                            product: { select: { id: true, name: true } },
                        },
                    });

                    const forSender = formatConversation(
                        fullConvo,
                        userId,
                        getOnlineSet()
                    );
                    const forReceiver = formatConversation(
                        fullConvo,
                        otherParticipant.userId,
                        getOnlineSet()
                    );

                    io.to(`user:${userId}`).emit('conversation_updated', forSender);
                    io.to(`user:${otherParticipant.userId}`).emit(
                        'conversation_updated',
                        forReceiver
                    );
                }

                callback?.({ success: true, message: formatted });
            } catch (error) {
                callback?.({ error: error.message });
            }
        });

        socket.on('typing', ({ conversationId, isTyping }) => {
            socket.to(`conversation:${conversationId}`).emit('user_typing', {
                conversationId,
                userId,
                isTyping,
            });
        });

        socket.on('mark_read', async (conversationId) => {
            const id = parseInt(conversationId, 10);
            const participant = await prisma.conversationParticipant.findFirst({
                where: { conversationId: id, userId },
            });
            if (!participant) return;

            await prisma.conversationParticipant.update({
                where: { id: participant.id },
                data: { lastReadAt: new Date() },
            });

            await prisma.message.updateMany({
                where: {
                    conversationId: id,
                    senderId: { not: userId },
                    read: false,
                },
                data: { read: true },
            });

            socket.to(`conversation:${id}`).emit('messages_read', {
                conversationId: id,
                readByUserId: userId,
            });
        });

        socket.on('disconnect', () => {
            if (onlineUsers.get(userId) === socket.id) {
                onlineUsers.delete(userId);
                io.emit('user_offline', { userId });
            }
        });
    });

    return io;
};

module.exports = { setupSocket, onlineUsers };
