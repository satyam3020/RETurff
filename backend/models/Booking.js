const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        venueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue',
            required: true,
        },
        slotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Slot',
            required: true,
        },
        // Denormalized for display (avoids extra lookups)
        venueName: { type: String, required: true },
        venueLocation: { type: String, default: '' },
        date: { type: String, required: true },       // 'YYYY-MM-DD'
        startTime: { type: String, required: true },  // '6:00 AM'
        endTime: { type: String, required: true },    // '7:00 AM'
        sport: { type: String, default: null },
        surface: { type: String, default: null },

        status: {
            type: String,
            enum: ['pending', 'approved', 'completed', 'cancelled', 'rejected'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'paid', 'refunded'],
            default: 'unpaid',
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        userName: { type: String, required: true },
        userPhone: { type: String, required: true },
        adminNote: { type: String, default: '' }, // Admin can add notes on approve/reject
    },
    { timestamps: true }
);

// Index for admin queries
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ venueId: 1, date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
