const rateLimit = require("express-rate-limit");

/**
 * Strict rate limiter for authentication routes (login, register)
 * Mitigates brute-force credential stuffing and denial-of-service attempts.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per IP per window
    standardHeaders: true, // Return RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    message: {
        success: false,
        message: "Too many authentication attempts from this IP. Please try again in 15 minutes.",
    },
    // Skip rate limiting in automated test environments if NODE_ENV === 'test'
    skip: () => process.env.NODE_ENV === "test",
});

/**
 * General API rate limiter for all other routes
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again later.",
    },
    skip: () => process.env.NODE_ENV === "test",
});

module.exports = {
    authLimiter,
    apiLimiter,
};
