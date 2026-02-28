const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    registerValidation,
    loginValidation
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login  (rate limited)
router.post('/login', loginRateLimiter, loginValidation, login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;
