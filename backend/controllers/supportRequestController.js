const { body, validationResult } = require('express-validator');
const SupportRequest = require('../models/SupportRequest');

// ─── Validation ──────────────────────────────────────────────────────────────
const requestValidation = [
    body('category').isIn(['bookings', 'cancellations', 'payments', 'other']).withMessage('Invalid category'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
];

// ─── User: Create a Support Request ──────────────────────────────────────────
const createRequest = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { category, subject, description } = req.body;

        const request = await SupportRequest.create({
            userId: req.user._id,
            userName: req.user.name,
            userPhone: req.user.phone,
            category,
            subject,
            description,
        });

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
};

// ─── User: Get My Support Requests ───────────────────────────────────────────
const getMyRequests = async (req, res, next) => {
    try {
        const requests = await SupportRequest.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

// ─── Admin: Get All Support Requests ─────────────────────────────────────────
const getAllRequests = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }

        const requests = await SupportRequest.find(filter)
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

// ─── Admin: Update Request Status ────────────────────────────────────────────
const updateRequestStatus = async (req, res, next) => {
    try {
        const { status, adminNote } = req.body;
        const update = {};
        if (status) update.status = status;
        if (adminNote !== undefined) update.adminNote = adminNote;

        const request = await SupportRequest.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requestValidation,
    createRequest,
    getMyRequests,
    getAllRequests,
    updateRequestStatus,
};
