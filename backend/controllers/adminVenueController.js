const Venue = require('../models/Venue');
const { body, validationResult } = require('express-validator');

// Validation rules
const venueValidation = [
    body('name').trim().notEmpty().withMessage('Venue name is required'),
    body('location.address').notEmpty().withMessage('Address is required'),
    body('pricePerHour').isNumeric().withMessage('Price must be a number'),
];

/**
 * GET /api/admin/venues
 * List all venues with optional filters
 */
const getAllVenues = async (req, res, next) => {
    try {
        const { isActive, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const venues = await Venue.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Venue.countDocuments(filter);

        res.json({ success: true, data: venues, total, page: Number(page) });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/venues/:id
 */
const getVenueById = async (req, res, next) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
        res.json({ success: true, data: venue });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/venues
 */
const createVenue = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const venue = await Venue.create(req.body);
        res.status(201).json({ success: true, data: venue });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/venues/:id
 */
const updateVenue = async (req, res, next) => {
    try {
        const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
        res.json({ success: true, data: venue });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/venues/:id
 */
const deleteVenue = async (req, res, next) => {
    try {
        const venue = await Venue.findByIdAndDelete(req.params.id);
        if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
        res.json({ success: true, message: 'Venue deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/admin/venues/:id/toggle
 * Toggle active/inactive
 */
const toggleVenueActive = async (req, res, next) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
        venue.isActive = !venue.isActive;
        await venue.save();
        res.json({ success: true, data: venue, message: `Venue ${venue.isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllVenues, getVenueById, createVenue,
    updateVenue, deleteVenue, toggleVenueActive, venueValidation
};
