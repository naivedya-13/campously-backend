const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const {
    listConversations,
    createOrGetConversation,
    getMessages,
    markAsRead,
} = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', listConversations);
router.post('/conversations', createOrGetConversation);
router.get('/conversations/:id/messages', getMessages);
router.patch('/conversations/:id/read', markAsRead);

module.exports = router;
