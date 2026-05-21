const {
    prisma,
    getConversationForUser,
    findExistingConversation,
    formatConversation,
    formatMessage,
} = require('./helper');

const listConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const getOnline = req.app.get('getOnlineUserIds');
        const onlineIds = getOnline ? getOnline() : new Set();

        const conversations = await prisma.conversation.findMany({
            where: {
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
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                product: { select: { id: true, name: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        const formatted = await Promise.all(
            conversations.map(async (c) => {
                const myParticipant = c.participants.find((p) => p.userId === userId);
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: c.id,
                        senderId: { not: userId },
                        ...(myParticipant?.lastReadAt
                            ? { createdAt: { gt: myParticipant.lastReadAt } }
                            : {}),
                    },
                });
                return formatConversation(
                    { ...c, messages: c.messages, unreadCount },
                    userId,
                    onlineIds
                );
            })
        );

        res.json({ conversations: formatted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createOrGetConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const participantId = parseInt(req.body.participantId, 10);
        const productId = req.body.productId
            ? parseInt(req.body.productId, 10)
            : null;

        if (!participantId || participantId === userId) {
            return res.status(400).json({ error: 'Valid participant ID is required.' });
        }

        const participant = await prisma.user.findUnique({
            where: { id: participantId },
        });
        if (!participant) {
            return res.status(404).json({ error: 'Participant not found.' });
        }

        if (productId) {
            const product = await prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                return res.status(404).json({ error: 'Product not found.' });
            }
        }

        let conversation = await findExistingConversation(
            userId,
            participantId,
            productId
        );

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    productId,
                    participants: {
                        create: [{ userId }, { userId: participantId }],
                    },
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
                    messages: true,
                    product: { select: { id: true, name: true } },
                },
            });
        } else {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversation.id },
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
                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    product: { select: { id: true, name: true } },
                },
            });
        }

        const getOnline = req.app.get('getOnlineUserIds');
        const onlineIds = getOnline ? getOnline() : new Set();
        res.status(201).json({
            conversation: formatConversation(conversation, userId, onlineIds),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id, 10);

        const conversation = await getConversationForUser(conversationId, userId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found.' });
        }

        res.json({
            messages: conversation.messages.map(formatMessage),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id, 10);

        const participant = await prisma.conversationParticipant.findFirst({
            where: { conversationId, userId },
        });

        if (!participant) {
            return res.status(404).json({ error: 'Conversation not found.' });
        }

        await prisma.conversationParticipant.update({
            where: { id: participant.id },
            data: { lastReadAt: new Date() },
        });

        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                read: false,
            },
            data: { read: true },
        });

        res.json({ message: 'Marked as read.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listConversations,
    createOrGetConversation,
    getMessages,
    markAsRead,
};
