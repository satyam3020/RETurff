const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getMyBookings, createBooking, getProfile, updateProfile,
    getVenues, getAvailableSlots, getNotifications, markNotificationRead,
    bookingValidation,
} = require('../controllers/userController');

// All user routes require authentication
router.use(authMiddleware);

// ─── Profile ─────────────────────────────────────────
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// ─── Venues (read-only for users) ────────────────────
router.get('/venues', getVenues);
router.get('/venues/:id/slots', getAvailableSlots);

// ─── Bookings ────────────────────────────────────────
router.get('/bookings', getMyBookings);
router.post('/bookings', bookingValidation, createBooking);

// ─── Notifications ───────────────────────────────────
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

module.exports = router;
