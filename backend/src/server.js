const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET environment variable is missing.");
    process.exit(1);
}

const { apiLimiter } = require("./middleware/rateLimiter");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================
// SECURITY HEADERS (Helmet)
// =========================================
app.use(
    helmet({
        // Allow static assets (like uploaded product images) to be loaded by frontend apps
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// =========================================
// CORS CONFIGURATION
// =========================================
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or in whitelist
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS blocked: Origin not allowed"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// =========================================
// REQUEST PARSING & BODY SIZE LIMITS
// =========================================
// Limit request body size to mitigate DoS attacks
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// =========================================
// STATIC ASSET SERVING
// =========================================
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =========================================
// RATE LIMITING
// =========================================
// Apply general rate limiting across all /api routes
app.use("/api", apiLimiter);

// Root health check endpoint
app.get("/", (req, res) => {
    res.json({
        message: "E-commerce API is running",
        status: "healthy",
    });
});

// =========================================
// API ROUTES
// =========================================
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// =========================================
// ERROR HANDLING (404 and Centralized Handler)
// =========================================
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;