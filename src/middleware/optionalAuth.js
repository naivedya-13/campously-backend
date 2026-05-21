const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        if (token) {
            req.user = jwt.verify(token, jwtSecret);
        }
    } catch {
        // unauthenticated is fine
    }
    next();
};

module.exports = optionalAuth;
