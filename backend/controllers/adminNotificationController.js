const Notification = require('../models/Notification');
const { body, validationResult } = require('express-validator');

const notificationValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('type').isIn(['success', 'promo', 'warning', 'info']).withMessage('Invalid type'),
];

/**
 * GET /api/admin/notifications
 */
const getAllNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('createdBy', 'name');
        res.json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/notifications
 * Create global or targeted notification
 * Body: { title, message, type, isGlobal, targetUserId? }
 */
const createNotification = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const { title, message, type, isGlobal = true, targetUserId } = req.body;

        const notification = await Notification.create({
            title,
            message,
            type,
            isGlobal,
            targetUserId: isGlobal ? null : targetUserId,
            createdBy: req.user._id,
        });

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
    try {
        const n = await Notification.findByIdAndDelete(req.params.id);
        if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllNotifications, createNotification, deleteNotification, notificationValidation };
