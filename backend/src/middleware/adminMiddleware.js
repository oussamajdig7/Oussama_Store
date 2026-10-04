const jwt = require("jsonwebtoken");
const db = require("../config/database");

/**
 * Admin Authorization Middleware:
 * 1. Checks if user is authenticated (via req.user or JWT Bearer header).
 * 2. Checks if user role equals 'admin'.
 * 3. Non-admin users receive 403 Forbidden.
 */
const adminMiddleware = (req, res, next) => {
    try {
        let user = req.user;

        // If user was not already set by prior authMiddleware, authenticate here
        if (!user) {
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

            user = db
                .prepare("SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?")
                .get(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User no longer exists",
                });
            }

            req.user = user;
        }

        // Rule 2 & 3: Check admin role; non-admin receives 403 Forbidden
        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admin privileges required",
            });
        }

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

        console.error("Admin middleware error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = adminMiddleware;
