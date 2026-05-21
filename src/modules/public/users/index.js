const express = require('express');
const authMiddleware = require('../../../middleware/authMiddleware');
const { getMe, updateMe, updateAvatar, searchStudents } = require('./controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/search', searchStudents);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/avatar', updateAvatar);

module.exports = router;
