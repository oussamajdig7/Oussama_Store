const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

// =========================================
// POST /api/auth/register
// =========================================
const register = (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Fields 'name', 'email' and 'password' are required",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long",
            });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const result = db
            .prepare(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
            )
            .run(name, email, hashedPassword);

        const newUser = db
            .prepare("SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?")
            .get(result.lastInsertRowid);

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: newUser,
                token,
            },
        });
    } catch (error) {
        // Handle UNIQUE constraint violation on email
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists",
            });
        }

        console.error("Error registering user:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// POST /api/auth/login
// =========================================
const login = (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Fields 'email' and 'password' are required",
            });
        }

        // Find user by email
        const user = db
            .prepare("SELECT * FROM users WHERE email = ?")
            .get(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Verify password
        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        // Return safe user data (no password)
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at,
                    updated_at: user.updated_at,
                },
                token,
            },
        });
    } catch (error) {
        console.error("Error logging in:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// GET /api/auth/me (Protected)
// =========================================
const getMe = (req, res) => {
    try {
        // req.user is set by authMiddleware (never contains password)
        res.status(200).json({
            success: true,
            data: req.user,
        });
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
};
