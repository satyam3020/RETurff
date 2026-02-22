const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
        },
        type: {
            type: String,
            enum: ['success', 'promo', 'warning', 'info'],
            default: 'info',
        },
        isGlobal: {
            type: Boolean,
            default: true, // true = all users, false = specific user
        },
        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // only set if isGlobal is false
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ isGlobal: 1, createdAt: -1 });
notificationSchema.index({ targetUserId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
