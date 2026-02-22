const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Venue = require('../models/Venue');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const bookingValidation = [
    body('venueId').notEmpty().withMessage('venueId is required'),
    body('slotId').notEmpty().withMessage('slotId is required'),
    body('date').notEmpty().withMessage('date is required'),
    body('startTime').notEmpty().withMessage('startTime is required'),
    body('endTime').notEmpty().withMessage('endTime is required'),
    body('totalAmount').isNumeric().withMessage('totalAmount must be a number'),
];

/**
 * GET /api/user/bookings
 * Returns the authenticated user's bookings
 */
const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('venueId', 'name location images');
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/user/bookings
 * Create a new booking
 */
const createBooking = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const { venueId, slotId, date, startTime, endTime, sport, surface, totalAmount } = req.body;

        // Verify slot is still available
        const slot = await Slot.findById(slotId);
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
        if (!slot.isAvailable || slot.isBlocked) {
            return res.status(400).json({ success: false, message: 'This slot is no longer available' });
        }

        const venue = await Venue.findById(venueId);
        if (!venue || !venue.isActive) {
            return res.status(404).json({ success: false, message: 'Venue not found or inactive' });
        }

        // Create booking with status 'pending' (admin must approve)
        const booking = await Booking.create({
            userId: req.user._id,
            venueId,
            slotId,
            venueName: venue.name,
            venueLocation: venue.location.address,
            date,
            startTime,
            endTime,
            sport: sport || null,
            surface: surface || null,
            totalAmount: Number(totalAmount),
            status: 'pending',
            paymentStatus: 'unpaid',
            userName: req.user.name,
            userPhone: req.user.phone,
        });

        // Temporarily mark slot as unavailable (until admin acts)
        await Slot.findByIdAndUpdate(slotId, { isAvailable: false });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/profile
 */
const getProfile = async (req, res) => {
    res.json({ success: true, data: req.user });
};

/**
 * PUT /api/user/profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, preferences } = req.body;
        const update = {};
        if (name) update.name = name;
        if (preferences) update.preferences = preferences;

        const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/venues
 * Public venue listing for the user app
 */
const getVenues = async (req, res, next) => {
    try {
        const venues = await Venue.find({ isActive: true }).sort({ rating: -1 });
        res.json({ success: true, data: venues });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/venues/:id/slots?date=YYYY-MM-DD
 */
const getAvailableSlots = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ success: false, message: 'date query param required' });

        const slots = await Slot.find({
            venueId: req.params.id,
            date,
            isAvailable: true,
            isBlocked: false,
        }).sort({ startTime: 1 });

        res.json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/notifications
 * Global + user-targeted notifications (unread first)
 */
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            $or: [{ isGlobal: true }, { targetUserId: req.user._id }],
        }).sort({ createdAt: -1 }).limit(30);

        const enriched = notifications.map((n) => ({
            ...n.toObject(),
            isRead: n.readBy.includes(req.user._id),
        }));

        res.json({ success: true, data: enriched });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/user/notifications/:id/read
 */
const markNotificationRead = async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            $addToSet: { readBy: req.user._id },
        });
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyBookings, createBooking, getProfile, updateProfile,
    getVenues, getAvailableSlots, getNotifications, markNotificationRead,
    bookingValidation,
};
