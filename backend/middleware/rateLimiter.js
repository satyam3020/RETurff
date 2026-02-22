const rateLimit = require('express-rate-limit');

/**
 * loginRateLimiter
 * Max 10 login attempts per 15 minutes per IP
 */
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.',
    },
});

/**
 * apiRateLimiter
 * General rate limiter for all API routes (100 req/min)
 */
const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please slow down.',
    },
});

module.exports = { loginRateLimiter, apiRateLimiter };
