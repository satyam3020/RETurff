/**
 * adminMiddleware
 * Must run AFTER authMiddleware (requires req.user to be set)
 * Rejects any non-admin user with 403 Forbidden
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }
    next();
};

module.exports = adminMiddleware;
