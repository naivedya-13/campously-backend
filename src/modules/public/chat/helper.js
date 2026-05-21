const prisma = require('../../../config/prisma');

const avatarUrl = (enrollmentId) =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollmentId}`;

const getConversationForUser = async (conversationId, userId) => {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: { some: { userId } },
        },
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
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: {
                        select: { id: true, name: true, enrollmentId: true },
                    },
                },
            },
            product: { select: { id: true, name: true } },
        },
    });
    return conversation;
};

const findExistingConversation = async (userId, participantId, productId) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            productId: productId || null,
            AND: [
                { participants: { some: { userId } } },
                { participants: { some: { userId: participantId } } },
            ],
        },
        include: {
            participants: true,
        },
    });

    return conversations.find((c) => c.participants.length === 2) || null;
};

const formatConversation = (conversation, currentUserId, onlineUserIds = new Set()) => {
    const other = conversation.participants.find((p) => p.userId !== currentUserId);
    const otherUser = other?.user;
    const lastMessage = conversation.messages?.[conversation.messages.length - 1];

    const unreadCount =
        typeof conversation.unreadCount === 'number'
            ? conversation.unreadCount
            : 0;

    return {
        id: conversation.id,
        productId: conversation.productId,
        productName: conversation.product?.name || null,
        participantId: String(otherUser?.id),
        participantName: otherUser?.name || 'Unknown',
        participantAvatar: otherUser?.avatar || avatarUrl(otherUser?.enrollmentId || 'user'),
        lastMessage: lastMessage?.content || '',
        lastMessageTime: (lastMessage?.createdAt || conversation.updatedAt).toISOString(),
        unread: unreadCount,
        online: onlineUserIds.has(otherUser?.id),
    };
};

const formatMessage = (message) => ({
    id: String(message.id),
    chatId: String(message.conversationId),
    senderId: String(message.senderId),
    senderName: message.sender?.name || 'User',
    content: message.content,
    timestamp: message.createdAt.toISOString(),
    read: message.read,
});

module.exports = {
    prisma,
    avatarUrl,
    getConversationForUser,
    findExistingConversation,
    formatConversation,
    formatMessage,
};
