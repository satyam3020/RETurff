const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
    {
        venueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue',
            required: true,
        },
        date: {
            type: String, // Format: 'YYYY-MM-DD'
            required: [true, 'Date is required'],
        },
        startTime: {
            type: String, // Format: '6:00 AM'
            required: [true, 'Start time is required'],
        },
        endTime: {
            type: String, // Format: '7:00 AM'
            required: [true, 'End time is required'],
        },
        price: {
            type: Number,
            required: [true, 'Slot price is required'],
            min: 0,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isBlocked: {
            // Admin can manually block a slot
            type: Boolean,
            default: false,
        },
        sport: {
            type: String,
            default: null, // null means any sport
        },
        surface: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate slots for same venue/date/time
slotSchema.index({ venueId: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
