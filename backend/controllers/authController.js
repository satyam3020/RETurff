const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// ─── Helper ─────────────────────────────────────────
const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

const sendToken = (res, user, statusCode = 200) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
        },
    });
};

// ─── Validation Rules ────────────────────────────────
const registerValidation = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Enter a valid 10-digit phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
    body('phone').matches(/^[0-9]{10}$/).withMessage('Enter a valid 10-digit phone number'),
    body('password').notEmpty().withMessage('Password is required'),
];

// ─── Controllers ─────────────────────────────────────

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, phone, password } = req.body;

        const existing = await User.findOne({ phone });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Phone number already registered.' });
        }

        const user = await User.create({
            name,
            phone,
            passwordHash: password, // pre-save hook hashes this
        });

        sendToken(res, user, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { phone, password } = req.body;

        // Select passwordHash explicitly (it's hidden by default)
        const user = await User.findOne({ phone }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid phone or password.' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid phone or password.' });
        }

        sendToken(res, user);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 * Returns currently authenticated user
 */
const getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe, registerValidation, loginValidation };
