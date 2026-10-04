const db = require("../config/database");

// =========================================
// GET /api/admin/dashboard
// =========================================
const getDashboardStats = (req, res) => {
    try {
        // 1. Total users
        const totalUsersResult = db
            .prepare("SELECT COUNT(*) AS count FROM users")
            .get();
        const totalUsers = totalUsersResult ? totalUsersResult.count : 0;

        // 2. Total products
        const totalProductsResult = db
            .prepare("SELECT COUNT(*) AS count FROM products")
            .get();
        const totalProducts = totalProductsResult ? totalProductsResult.count : 0;

        // 3. Total orders
        const totalOrdersResult = db
            .prepare("SELECT COUNT(*) AS count FROM orders")
            .get();
        const totalOrders = totalOrdersResult ? totalOrdersResult.count : 0;

        // 4. Total revenue (sum of non-cancelled orders)
        const totalRevenueResult = db
            .prepare("SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != 'cancelled'")
            .get();
        const totalRevenue = totalRevenueResult ? Number(totalRevenueResult.revenue.toFixed(2)) : 0;

        // 5. Pending orders
        const pendingOrdersResult = db
            .prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'")
            .get();
        const pendingOrders = pendingOrdersResult ? pendingOrdersResult.count : 0;

        // 6. Delivered orders
        const deliveredOrdersResult = db
            .prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'delivered'")
            .get();
        const deliveredOrders = deliveredOrdersResult ? deliveredOrdersResult.count : 0;

        // Additional helpful metrics for dashboard richness
        const processingOrdersResult = db
            .prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'processing'")
            .get();
        const processingOrders = processingOrdersResult ? processingOrdersResult.count : 0;

        const shippedOrdersResult = db
            .prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'shipped'")
            .get();
        const shippedOrders = shippedOrdersResult ? shippedOrdersResult.count : 0;

        const cancelledOrdersResult = db
            .prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'cancelled'")
            .get();
        const cancelledOrders = cancelledOrdersResult ? cancelledOrdersResult.count : 0;

        // Recent orders (last 5)
        const recentOrders = db
            .prepare(
                `SELECT o.id, o.user_id, o.total, o.status, o.shipping_address, o.created_at,
                        u.name AS user_name, u.email AS user_email
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 ORDER BY o.id DESC
                 LIMIT 5`
            )
            .all();

        // Recent users (last 5)
        const recentUsers = db
            .prepare(
                `SELECT id, name, email, role, created_at
                 FROM users
                 ORDER BY id DESC
                 LIMIT 5`
            )
            .all();

        // Low stock products alert (stock <= 5)
        const lowStockProducts = db
            .prepare(
                `SELECT id, name, price, stock
                 FROM products
                 WHERE stock <= 5
                 ORDER BY stock ASC
                 LIMIT 5`
            )
            .all();

        res.status(200).json({
            success: true,
            data: {
                total_users: totalUsers,
                total_products: totalProducts,
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                pending_orders: pendingOrders,
                delivered_orders: deliveredOrders,
                processing_orders: processingOrders,
                shipped_orders: shippedOrders,
                cancelled_orders: cancelledOrders,
                stats: {
                    total_users: totalUsers,
                    total_products: totalProducts,
                    total_orders: totalOrders,
                    total_revenue: totalRevenue,
                    pending_orders: pendingOrders,
                    delivered_orders: deliveredOrders,
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    totalRevenue,
                    pendingOrders,
                    deliveredOrders,
                },
                recent_orders: recentOrders,
                recent_users: recentUsers,
                low_stock_products: lowStockProducts,
            },
        });
    } catch (error) {
        console.error("Error generating admin dashboard stats:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error fetching dashboard statistics",
        });
    }
};

// =========================================
// GET /api/admin/users
// =========================================
const getAdminUsers = (req, res) => {
    try {
        const users = db
            .prepare(
                `SELECT u.id, u.name, u.email, u.role, u.created_at, u.updated_at,
                        COUNT(o.id) AS orders_count,
                        COALESCE(SUM(o.total), 0) AS total_spent
                 FROM users u
                 LEFT JOIN orders o ON u.id = o.user_id
                 GROUP BY u.id
                 ORDER BY u.id DESC`
            )
            .all();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error("Error fetching admin users:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error fetching users",
        });
    }
};

// =========================================
// PUT /api/admin/users/:id/role
// =========================================
const updateUserRole = (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !["user", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Valid role ('user' or 'admin') is required",
            });
        }

        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Prevent self-demotion if current user is the sole admin
        if (req.user.id === Number(id) && role !== "admin") {
            const adminCount = db
                .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")
                .get().count;
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot demote yourself: at least one admin account is required",
                });
            }
        }

        db.prepare("UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(role, id);

        const updatedUser = db
            .prepare("SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?")
            .get(id);

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user role:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error updating user role",
        });
    }
};

// =========================================
// GET /api/admin/orders
// =========================================
const getAdminOrders = (req, res) => {
    try {
        const orders = db
            .prepare(
                `SELECT o.id, o.user_id, o.total, o.status, o.shipping_address, o.created_at, o.updated_at,
                        u.name AS user_name, u.email AS user_email
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 ORDER BY o.id DESC`
            )
            .all();

        const getItems = db.prepare(
            `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
                    p.name AS product_name, p.slug AS product_slug
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`
        );

        const ordersWithDetails = orders.map((order) => {
            const items = getItems.all(order.id);
            const itemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
            return {
                ...order,
                items_count: itemsCount,
                items,
            };
        });

        res.status(200).json({
            success: true,
            count: ordersWithDetails.length,
            data: ordersWithDetails,
        });
    } catch (error) {
        console.error("Error fetching admin orders:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error fetching orders",
        });
    }
};

// =========================================
// PUT /api/admin/orders/:id/status
// =========================================
const updateOrderStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowedStatuses.join(", ")}`,
            });
        }

        const existingOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        db.prepare(
            "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).run(status, id);

        const updatedOrder = db
            .prepare(
                `SELECT o.id, o.user_id, o.total, o.status, o.shipping_address, o.created_at, o.updated_at,
                        u.name AS user_name, u.email AS user_email
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 WHERE o.id = ?`
            )
            .get(id);

        res.status(200).json({
            success: true,
            message: `Order #${id} status updated to ${status}`,
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating order status:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error updating order status",
        });
    }
};

module.exports = {
    getDashboardStats,
    getAdminUsers,
    updateUserRole,
    getAdminOrders,
    updateOrderStatus,
};
