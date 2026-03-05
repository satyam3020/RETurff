const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userName: { type: String, required: true },
        userPhone: { type: String, required: true },
        category: {
            type: String,
            enum: ['bookings', 'cancellations', 'payments', 'other'],
            required: true,
        },
        subject: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved', 'closed'],
            default: 'open',
        },
        adminNote: { type: String, default: '' },
    },
    { timestamps: true }
);

// Indexes for efficient queries
supportRequestSchema.index({ userId: 1, createdAt: -1 });
supportRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
