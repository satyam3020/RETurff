const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * authMiddleware
 * Verifies JWT from Authorization header, attaches req.user
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.',
            });
        }

        // Fetch fresh user to check if blocked/deleted
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.',
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Contact support.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authMiddleware;
