const User = require('../models/User');
const Booking = require('../models/Booking');

/**
 * GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { role, isBlocked, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);
        res.json({ success: true, data: users, total, page: Number(page) });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/users/:id/bookings
 * All bookings for a specific user
 */
const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userId: req.params.id })
            .sort({ createdAt: -1 })
            .populate('venueId', 'name location');
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/admin/users/:id/block
 * Toggle block/unblock
 */
const toggleBlockUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: "Cannot block an admin account." });
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/admin/users/:id/promote
 * Promote user to admin role
 */
const promoteToAdmin = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: 'admin' },
            { new: true }
        );
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User promoted to admin', data: user });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllUsers, getUserById, getUserBookings, toggleBlockUser, promoteToAdmin };
