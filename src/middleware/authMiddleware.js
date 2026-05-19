const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        req.user = verified;
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;
