const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Access Denied. No token provided." });
        }

        const token = authHeader.split(' ')[1];

        // Token ko verify karo environment variable waale secret key se
       const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        req.user = verified; // Isme user ki id (req.user.id) controllers ko mil jayegi
        next(); // Gate khol do, agle kaam par jao
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;