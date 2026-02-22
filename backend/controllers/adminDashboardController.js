const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');

/**
 * GET /api/admin/dashboard
 * Overview stats for the admin panel
 */
const getDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const [
            totalUsers,
            totalVenues,
            totalBookings,
            todayBookings,
            pendingBookings,
            revenueAgg,
            recentBookings,
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Venue.countDocuments({ isActive: true }),
            Booking.countDocuments(),
            Booking.countDocuments({ date: todayStr }),
            Booking.countDocuments({ status: 'pending' }),
            Booking.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Booking.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('userId', 'name phone')
                .populate('venueId', 'name'),
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalVenues,
                    totalBookings,
                    todayBookings,
                    pendingBookings,
                    totalRevenue,
                },
                recentBookings,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboard };
