const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
    getDashboardStats,
    getAdminUsers,
    updateUserRole,
    getAdminOrders,
    updateOrderStatus,
} = require("../controllers/adminController");

// All admin routes strictly require admin privileges
router.use(adminMiddleware);

// GET /api/admin/dashboard - Overview statistics
router.get("/dashboard", getDashboardStats);

// GET /api/admin/users - Users list
router.get("/users", getAdminUsers);

// PUT /api/admin/users/:id/role - Update user role
router.put("/users/:id/role", updateUserRole);

// GET /api/admin/orders - All orders across the store
router.get("/orders", getAdminOrders);

// PUT /api/admin/orders/:id/status - Update order status
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;
