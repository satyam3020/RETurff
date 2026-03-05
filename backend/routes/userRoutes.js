const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getMyBookings, createBooking, getBookingById, getBookingHistory, getProfile, updateProfile,
    getVenues, getAvailableSlots, getVenuePitches, getNotifications, markNotificationRead,
    toggleFavourite, getFavouriteVenues, getProfileStats,
    bookingValidation,
} = require('../controllers/userController');
const { createRequest, getMyRequests, requestValidation } = require('../controllers/supportRequestController');

// All user routes require authentication
router.use(authMiddleware);

// ─── Profile ─────────────────────────────────────────
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/profile-stats', getProfileStats);

// ─── Venues (read-only for users) ────────────────────
router.get('/venues', getVenues);
router.get('/venues/:id/slots', getAvailableSlots);
router.get('/venues/:id/pitches', getVenuePitches);

// ─── Favourites ──────────────────────────────────────
router.get('/favourites', getFavouriteVenues);
router.post('/favourites/:venueId', toggleFavourite);

// ─── Bookings ────────────────────────────────────────
router.get('/bookings', getMyBookings);
router.get('/bookings/history', getBookingHistory);
router.get('/bookings/:id', getBookingById);
router.post('/bookings', bookingValidation, createBooking);

// ─── Notifications ───────────────────────────────────
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

// ─── Support Requests ────────────────────────────────
router.post('/support-requests', requestValidation, createRequest);
router.get('/support-requests', getMyRequests);

module.exports = router;
