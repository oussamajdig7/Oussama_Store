const multer = require("multer");
const { ZodError } = require("zod");

/**
 * Centralized Express error-handling middleware.
 * Ensures consistent error formatting, maps known error types (Zod, Multer, JWT),
 * and prevents information disclosure by masking internal details in production.
 */
const errorHandler = (err, req, res, next) => {
    // 1. Zod Validation Errors
    if (err instanceof ZodError || err.name === "ZodError") {
        const issues = err.issues || err.errors || [];
        const formattedErrors = issues.map((e) => ({
            field: Array.isArray(e.path) ? e.path.join(".") : String(e.path || ""),
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            message: formattedErrors[0]?.message || "Validation failed",
            errors: formattedErrors,
        });
    }

    // 2. Multer file upload errors
    if (err instanceof multer.MulterError) {
        let message = `File upload error: ${err.message}`;
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File is too large. Maximum allowed size is 5MB.";
        }
        return res.status(400).json({
            success: false,
            message,
        });
    }

    // 3. JWT Errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token has expired",
        });
    }

    // 4. Malformed JSON payload
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Malformed JSON payload in request body",
        });
    }

    // 5. CORS Blocked Errors
    if (err.message && err.message.includes("CORS blocked")) {
        return res.status(403).json({
            success: false,
            message: err.message,
        });
    }

    // 6. SQLite UNIQUE constraint errors
    if (err.message && err.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({
            success: false,
            message: "A resource with this identifier already exists",
        });
    }

    // 7. Custom application errors with statusCode
    const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

    // 8. Production-safe error response (never leak stack or internal SQL queries in production)
    const isProduction = process.env.NODE_ENV === "production";
    const message =
        statusCode === 500 && isProduction
            ? "Internal server error"
            : err.message || "An unexpected error occurred";

    // Safe error logging: log message only, never user input, credentials, or secrets
    console.error(`[Error] ${req.method} ${req.originalUrl} (${statusCode}):`, err.message);

    res.status(statusCode).json({
        success: false,
        message,
        ...(isProduction ? {} : { stack: err.stack }),
    });
};

/**
 * 404 Handler for undefined API routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

module.exports = {
    errorHandler,
    notFoundHandler,
};
