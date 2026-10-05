const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../schemas/authSchemas");
const { authLimiter } = require("../middleware/rateLimiter");

// Rate limit and validate registration endpoint
router.post("/register", authLimiter, validate({ body: registerSchema }), register);

// Rate limit and validate login endpoint (protects against brute-force)
router.post("/login", authLimiter, validate({ body: loginSchema }), login);

// Authenticated current user profile
router.get("/me", authMiddleware, getMe);

module.exports = router;
