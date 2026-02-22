const express = require('express');
const router = express.Router();
const { register, login, getMe, registerValidation, loginValidation } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login  (rate limited)
router.post('/login', loginRateLimiter, loginValidation, login);

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;
