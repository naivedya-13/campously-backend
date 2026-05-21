const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const { getNotifications, markRead, markAllRead } = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/read/:id', markRead);

module.exports = router;
