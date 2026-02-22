const Slot = require('../models/Slot');
const Venue = require('../models/Venue');

// Helper: format hour to "H:MM AM/PM"
const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
};

/**
 * GET /api/admin/slots?venueId=&date=
 */
const getSlots = async (req, res, next) => {
    try {
        const { venueId, date } = req.query;
        const filter = {};
        if (venueId) filter.venueId = venueId;
        if (date) filter.date = date;

        const slots = await Slot.find(filter).sort({ date: 1, startTime: 1 });
        res.json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/slots/bulk-generate
 * Generates hourly slots from venue operating hours for a given date
 * Body: { venueId, date, price }
 */
const bulkGenerateSlots = async (req, res, next) => {
    try {
        const { venueId, date, price } = req.body;

        if (!venueId || !date || !price) {
            return res.status(400).json({ success: false, message: 'venueId, date, and price are required' });
        }

        const venue = await Venue.findById(venueId);
        if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

        const { start, end } = venue.operatingHours; // e.g. 6 to 23
        const slotsToCreate = [];

        for (let hour = start; hour < end; hour++) {
            slotsToCreate.push({
                venueId,
                date,
                startTime: formatHour(hour),
                endTime: formatHour(hour + 1),
                price: Number(price),
                isAvailable: true,
                isBlocked: false,
            });
        }

        // insertMany with ordered:false skips duplicates (unique index)
        const result = await Slot.insertMany(slotsToCreate, { ordered: false }).catch((err) => {
            if (err.code === 11000) return { insertedCount: err.result?.nInserted || 0 };
            throw err;
        });

        res.status(201).json({
            success: true,
            message: `Generated ${slotsToCreate.length} slots for ${date}`,
            data: slotsToCreate,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/slots
 * Create a single slot
 */
const createSlot = async (req, res, next) => {
    try {
        const slot = await Slot.create(req.body);
        res.status(201).json({ success: true, data: slot });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/slots/:id
 * Update slot price, availability, or block it
 */
const updateSlot = async (req, res, next) => {
    try {
        const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
        res.json({ success: true, data: slot });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/admin/slots/:id/block
 * Toggle block/unblock
 */
const toggleSlotBlock = async (req, res, next) => {
    try {
        const slot = await Slot.findById(req.params.id);
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
        slot.isBlocked = !slot.isBlocked;
        slot.isAvailable = !slot.isBlocked;
        await slot.save();
        res.json({ success: true, data: slot });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/slots/:id
 */
const deleteSlot = async (req, res, next) => {
    try {
        const slot = await Slot.findByIdAndDelete(req.params.id);
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
        res.json({ success: true, message: 'Slot deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getSlots, bulkGenerateSlots, createSlot, updateSlot, toggleSlotBlock, deleteSlot };
