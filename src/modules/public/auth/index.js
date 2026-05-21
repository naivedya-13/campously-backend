const express = require('express');
const {
    register,
    login,
    verifyOtp,
    refreshToken,
    logout,
} = require('./controller');
const {
    validateRegisterBody,
    validateLoginBody,
} = require('../../../middleware/validateAuth');
const authRateLimiter = require('../../../middleware/rateLimitAuth');

const router = express.Router();

router.use(authRateLimiter);

router.post('/register', validateRegisterBody, register);
router.post('/login', validateLoginBody, login);
router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;
