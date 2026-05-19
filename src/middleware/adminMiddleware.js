const authMiddleware = require('./authMiddleware');

const adminMiddleware = (req, res, next) => {
    authMiddleware(req, res, () => {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        next();
    });
};

module.exports = adminMiddleware;
