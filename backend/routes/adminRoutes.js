const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Controllers
const { getDashboard, getFilteredStats } = require('../controllers/adminDashboardController');
const { getAllVenues, getVenueById, createVenue, updateVenue, deleteVenue, toggleVenueActive, venueValidation } = require('../controllers/adminVenueController');
const { getSlots, bulkGenerateSlots, createSlot, updateSlot, toggleSlotBlock, deleteSlot } = require('../controllers/adminSlotController');
const { getAllBookings, getBookingById, updateBookingStatus } = require('../controllers/adminBookingController');
const { getAllUsers, getUserById, getUserBookings, toggleBlockUser, promoteToAdmin } = require('../controllers/adminUserController');
const { getAllNotifications, createNotification, deleteNotification, notificationValidation } = require('../controllers/adminNotificationController');

// Apply auth + admin guard to ALL routes in this router
router.use(authMiddleware, adminMiddleware);

// ─── Dashboard ───────────────────────────────────────
router.get('/dashboard', getDashboard);
router.get('/dashboard/filtered-stats', getFilteredStats);

// ─── Venues ──────────────────────────────────────────
router.get('/venues', getAllVenues);
router.get('/venues/:id', getVenueById);
router.post('/venues', venueValidation, createVenue);
router.put('/venues/:id', updateVenue);
router.delete('/venues/:id', deleteVenue);
router.patch('/venues/:id/toggle', toggleVenueActive);

// ─── Slots ───────────────────────────────────────────
router.get('/slots', getSlots);
router.post('/slots', createSlot);
router.post('/slots/bulk-generate', bulkGenerateSlots);
router.put('/slots/:id', updateSlot);
router.patch('/slots/:id/block', toggleSlotBlock);
router.delete('/slots/:id', deleteSlot);

// ─── Bookings ────────────────────────────────────────
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.put('/bookings/:id', updateBookingStatus);

// ─── Users ───────────────────────────────────────────
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/bookings', getUserBookings);
router.patch('/users/:id/block', toggleBlockUser);
router.patch('/users/:id/promote', promoteToAdmin);

// ─── Notifications ───────────────────────────────────
router.get('/notifications', getAllNotifications);
router.post('/notifications', notificationValidation, createNotification);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
