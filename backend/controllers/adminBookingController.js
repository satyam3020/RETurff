const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

/**
 * GET /api/admin/bookings
 * Filter by status, date, venueId; paginated
 */
const getAllBookings = async (req, res, next) => {
    try {
        const { status, date, venueId, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (date) filter.date = date;
        if (venueId) filter.venueId = venueId;

        const bookings = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('userId', 'name phone')
            .populate('venueId', 'name location');

        const total = await Booking.countDocuments(filter);

        res.json({ success: true, data: bookings, total, page: Number(page) });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/bookings/:id
 */
const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name phone')
            .populate('venueId', 'name location images')
            .populate('slotId');

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/bookings/:id
 * Update status or paymentStatus
 * Body: { status?, paymentStatus?, adminNote? }
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { status, paymentStatus, adminNote } = req.body;
        const allowedStatuses = ['pending', 'approved', 'completed', 'cancelled', 'rejected'];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const update = {};
        if (status) update.status = status;
        if (paymentStatus) update.paymentStatus = paymentStatus;
        if (adminNote !== undefined) update.adminNote = adminNote;

        const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // If booking is cancelled/rejected, free the slot
        if (status === 'cancelled' || status === 'rejected') {
            await Slot.findByIdAndUpdate(booking.slotId, { isAvailable: true });
        }

        // If booking is approved, mark slot unavailable
        if (status === 'approved') {
            await Slot.findByIdAndUpdate(booking.slotId, { isAvailable: false });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllBookings, getBookingById, updateBookingStatus };
