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

/**
 * Helper: compute a date cutoff from a period string
 */
const getPeriodDate = (period) => {
    const now = new Date();
    switch (period) {
        case '24h': now.setHours(now.getHours() - 24); break;
        case '1week': now.setDate(now.getDate() - 7); break;
        case '1month': now.setMonth(now.getMonth() - 1); break;
        case '6months': now.setMonth(now.getMonth() - 6); break;
        case '1year': now.setFullYear(now.getFullYear() - 1); break;
        default: return null; // 'all' — no filter
    }
    return now;
};

/**
 * GET /api/admin/dashboard/filtered-stats?period=24h|1week|1month|6months|1year|all
 * Returns bookings count and revenue for the given period
 */
const getFilteredStats = async (req, res, next) => {
    try {
        const period = req.query.period || 'all';
        const sinceDate = getPeriodDate(period);

        const dateFilter = sinceDate ? { createdAt: { $gte: sinceDate } } : {};

        const [bookingsCount, revenueAgg, bookings] = await Promise.all([
            Booking.countDocuments(dateFilter),
            Booking.aggregate([
                { $match: { ...dateFilter, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Booking.find(dateFilter)
                .sort({ createdAt: -1 })
                .limit(20)
                .select('venueName userName date startTime endTime totalAmount status paymentStatus sport createdAt'),
        ]);

        const revenue = revenueAgg[0]?.total || 0;

        // Status breakdown
        const statusBreakdown = await Booking.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.json({
            success: true,
            data: {
                period,
                bookingsCount,
                revenue,
                statusBreakdown: statusBreakdown.reduce((acc, s) => {
                    acc[s._id] = s.count;
                    return acc;
                }, {}),
                bookings,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboard, getFilteredStats };
