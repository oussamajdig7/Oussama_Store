const jwt = require("jsonwebtoken");
const db = require("../config/database");

// =========================================
// Authentication Middleware
// =========================================
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify user still exists in the database
        const user = db
            .prepare("SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?")
            .get(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        console.error("Auth middleware error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = authMiddleware;
