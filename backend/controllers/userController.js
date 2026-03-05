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
 * Helper: parse a booking's date + endTime into a JS Date.
 * date is 'YYYY-MM-DD', endTime is like '7:00 PM'.
 */
const parseBookingEnd = (dateStr, endTime) => {
    try {
        // e.g. endTime = '7:00 PM'
        const [time, meridian] = endTime.trim().split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (meridian && meridian.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (meridian && meridian.toUpperCase() === 'AM' && hours === 12) hours = 0;
        const d = new Date(`${dateStr}T00:00:00`);
        d.setHours(hours, minutes, 0, 0);
        return d;
    } catch {
        return null;
    }
};

/**
 * GET /api/user/bookings
 * Returns only ACTIVE bookings (pending / approved whose slot time has not yet passed).
 * Also auto-completes any approved bookings whose time has passed.
 */
const getMyBookings = async (req, res, next) => {
    try {
        // 1. Auto-complete past approved bookings
        const now = new Date();
        const approvedBookings = await Booking.find({
            userId: req.user._id,
            status: 'approved',
        });

        const idsToComplete = [];
        for (const b of approvedBookings) {
            const end = parseBookingEnd(b.date, b.endTime);
            if (end && end < now) idsToComplete.push(b._id);
        }
        if (idsToComplete.length > 0) {
            await Booking.updateMany(
                { _id: { $in: idsToComplete } },
                { status: 'completed' }
            );
        }

        // 2. Also auto-complete past pending bookings
        const pendingBookings = await Booking.find({
            userId: req.user._id,
            status: 'pending',
        });

        const pendingIdsToComplete = [];
        for (const b of pendingBookings) {
            const end = parseBookingEnd(b.date, b.endTime);
            if (end && end < now) pendingIdsToComplete.push(b._id);
        }
        if (pendingIdsToComplete.length > 0) {
            await Booking.updateMany(
                { _id: { $in: pendingIdsToComplete } },
                { status: 'completed' }
            );
        }

        // 3. Return only active bookings (pending + approved)
        const bookings = await Booking.find({
            userId: req.user._id,
            status: { $in: ['pending', 'approved'] },
        })
            .sort({ createdAt: -1 })
            .populate('venueId', 'name location images');

        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/bookings/history
 * Returns past bookings: completed, cancelled, rejected
 */
const getBookingHistory = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            userId: req.user._id,
            status: { $in: ['completed', 'cancelled', 'rejected'] },
        })
            .sort({ createdAt: -1 })
            .populate('venueId', 'name location images');

        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

/**
 * Helper: compute user-friendly display status from booking + payment status
 */
const computeDisplayStatus = (booking) => {
    if (booking.status === 'completed') return 'Completed';
    if (booking.status === 'cancelled') return 'Cancelled';
    if (booking.status === 'rejected') return 'Rejected';
    if (booking.paymentStatus === 'paid' && booking.status === 'approved') return 'Booking Confirmed';
    if (booking.paymentStatus === 'paid' && booking.status === 'pending') return 'Payment Confirmed';
    if (booking.paymentStatus === 'unpaid') return 'Payment Pending';
    return booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
};

/**
 * GET /api/user/bookings/:id
 * Returns a single booking owned by the authenticated user, with displayStatus
 */
const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            userId: req.user._id,
        }).populate('venueId', 'name location images');

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const bookingObj = booking.toObject();
        bookingObj.displayStatus = computeDisplayStatus(bookingObj);

        res.json({ success: true, data: bookingObj });
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
        const { name, preferences, profileImage, bio, promptsAnswered } = req.body;
        const update = {};
        if (name) update.name = name;
        if (preferences) update.preferences = preferences;
        if (profileImage !== undefined) update.profileImage = profileImage;
        if (bio !== undefined) update.bio = bio;
        if (promptsAnswered !== undefined) update.promptsAnswered = promptsAnswered;

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
 * GET /api/user/venues/:id/slots?date=YYYY-MM-DD&sport=Cricket&surface=Pitch 1
 */
const getAvailableSlots = async (req, res, next) => {
    try {
        const { date, sport, surface } = req.query;
        if (!date) return res.status(400).json({ success: false, message: 'date query param required' });

        const filter = {
            venueId: req.params.id,
            date,
            isAvailable: true,
            isBlocked: false,
        };

        // Filter by sport if provided
        if (sport) filter.sport = sport;

        // Filter by surface/pitch if provided
        if (surface) filter.surface = surface;

        const slots = await Slot.find(filter).sort({ startTime: 1 });

        res.json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/venues/:id/pitches?sport=Cricket
 * Returns the distinct surfaces (pitches) that have at least one available slot
 * for the given venue and sport. Used by the user side to show dynamic pitch list.
 */
const getVenuePitches = async (req, res, next) => {
    try {
        const { sport } = req.query;
        const filter = {
            venueId: req.params.id,
            isAvailable: true,
            isBlocked: false,
            surface: { $exists: true, $ne: null, $ne: '' },
        };
        if (sport) filter.sport = sport;

        const pitches = await Slot.distinct('surface', filter);
        res.json({ success: true, data: pitches.filter(Boolean).sort() });
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

/**
 * POST /api/user/favourites/:venueId
 * Toggle favourite status for a venue
 */
const toggleFavourite = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const user = await User.findById(req.user._id);

        const idx = user.favouriteVenues.indexOf(venueId);
        if (idx === -1) {
            user.favouriteVenues.push(venueId);
        } else {
            user.favouriteVenues.splice(idx, 1);
        }
        await user.save();

        res.json({
            success: true,
            isFavourite: idx === -1, // true if just added
            data: user.favouriteVenues,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/favourites
 * Get user's favourite venues with full venue details
 */
const getFavouriteVenues = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('favouriteVenues');
        res.json({ success: true, data: user.favouriteVenues || [] });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/profile-stats
 * Returns booking count and favourite venue count for the profile screen
 */
const getProfileStats = async (req, res, next) => {
    try {
        const [bookingCount, user] = await Promise.all([
            Booking.countDocuments({ userId: req.user._id }),
            User.findById(req.user._id),
        ]);

        res.json({
            success: true,
            data: {
                bookings: bookingCount,
                favouriteVenues: user.favouriteVenues?.length || 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyBookings, createBooking, getBookingById, getBookingHistory, getProfile, updateProfile,
    getVenues, getAvailableSlots, getVenuePitches, getNotifications, markNotificationRead,
    toggleFavourite, getFavouriteVenues, getProfileStats,
    bookingValidation,
};

