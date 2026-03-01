const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// ─── Helpers ────────────────────────────────────────
const signAccessToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

const signRefreshToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });

const sendTokens = (res, user, statusCode = 200) => {
    const token = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    res.status(statusCode).json({
        success: true,
        token,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
        },
    });
};

// ─── Validation Rules ────────────────────────────────
const registerValidation = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Enter a valid 10-digit phone number'),
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
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

        const { name, phone, email, password } = req.body;

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ success: false, message: 'Phone number already registered.' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const user = await User.create({
            name,
            phone,
            email,
            passwordHash: password, // pre-save hook hashes this
        });

        sendTokens(res, user, 201);
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

        sendTokens(res, user);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/refresh-token
 * Accepts { refreshToken } in body, returns fresh accessToken + rotated refreshToken
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Refresh token is required.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
        }

        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found.' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });
        }

        // Issue fresh tokens (rotation)
        const newAccessToken = signAccessToken(user._id);
        const newRefreshToken = signRefreshToken(user._id);

        res.json({
            success: true,
            token: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        });
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

module.exports = { register, login, getMe, refreshToken, registerValidation, loginValidation };
/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        // Send Real Email
        try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: `"RETurf Support" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Reset OTP - RETurf',
                text: `Your OTP for password reset is: ${otp}. Valid for 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #FF5722;">RETurf Password Reset</h2>
                        <p>Hello,</p>
                        <p>You requested to reset your password. Use the following OTP to proceed:</p>
                        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #FF5722;">
                            ${otp}
                        </div>
                        <p style="margin-top: 20px;">This OTP is valid for <b>10 minutes</b>. If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #888;">Note: For Gmail, please use an <b>App Password</b> if 2FA is enabled.</p>
                    </div>
                `,
            });

            console.log(`✅ OTP sent to ${user.email}`);
            res.json({ success: true, message: 'OTP sent successfully to your email.' });
        } catch (mailError) {
            console.error('❌ Email Delivery Failed:', mailError.message);

            // Fallback for development if credentials aren't set yet
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log(`⚠️  [DEV FALLBACK] OTP for ${email}: ${otp}`);
                return res.status(500).json({
                    success: false,
                    message: 'Email service not configured. Please add EMAIL_USER and EMAIL_PASS to backend .env'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to send email. Check internet or email credentials.'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        // Update password
        user.passwordHash = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully. You can now login with your phone number and new password.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    refreshToken,
    forgotPassword,
    resetPassword,
    registerValidation,
    loginValidation
};
