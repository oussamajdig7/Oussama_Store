const db = require("../config/database");

/**
 * Transaction to create an order atomically:
 * 1. Read cart items and lock prices/stock from database
 * 2. Validate stock for every item
 * 3. Calculate server-side total
 * 4. Insert order with status 'pending'
 * 5. Insert order_items with price snapshot
 * 6. Deduct product stock
 * 7. Clear user's cart
 *
 * If ANY step fails, better-sqlite3 automatically rolls back the entire transaction.
 */
const executeOrderTransaction = db.transaction((userId, shippingAddress) => {
    // 1. Fetch user's cart items with live database product prices and stock
    const cartItems = db
        .prepare(
            `SELECT 
                c.id AS cart_item_id,
                c.product_id,
                c.quantity,
                p.name AS product_name,
                p.slug AS product_slug,
                p.price AS unit_price,
                p.stock AS current_stock
             FROM cart_items c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`
        )
        .all(userId);

    if (!cartItems || cartItems.length === 0) {
        const error = new Error("Your cart is empty. Add products to cart before placing an order.");
        error.statusCode = 400;
        throw error;
    }

    // 2. Validate stock for all cart items
    for (const item of cartItems) {
        if (item.quantity > item.current_stock) {
            const error = new Error(
                `Insufficient stock for "${item.product_name}". Only ${item.current_stock} available (${item.quantity} requested).`
            );
            error.statusCode = 400;
            throw error;
        }
    }

    // 3. Compute server-side total (never trust prices from frontend)
    const total = Math.round(
        cartItems.reduce((acc, item) => acc + item.quantity * item.unit_price, 0) * 100
    ) / 100;

    // 4. Create order record
    const insertOrder = db.prepare(
        `INSERT INTO orders (user_id, total, status, shipping_address)
         VALUES (?, ?, 'pending', ?)`
    );
    const orderResult = insertOrder.run(userId, total, shippingAddress);
    const orderId = orderResult.lastInsertRowid;

    // 5. Insert order_items with price snapshot & deduct product stock
    const insertOrderItem = db.prepare(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`
    );
    const deductStock = db.prepare(
        `UPDATE products 
         SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`
    );

    for (const item of cartItems) {
        insertOrderItem.run(orderId, item.product_id, item.quantity, item.unit_price);
        deductStock.run(item.quantity, item.product_id);
    }

    // 6. Clear user's cart
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);

    return {
        orderId,
        total,
        itemCount: cartItems.length,
    };
});

// =========================================
// POST /api/orders (Create Order)
// =========================================
const createOrder = (req, res) => {
    try {
        const { shipping_address } = req.body;

        // Validate shipping address
        if (!shipping_address) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required",
            });
        }

        let formattedAddress = '';
        if (typeof shipping_address === 'string') {
            formattedAddress = shipping_address.trim();
        } else if (typeof shipping_address === 'object' && shipping_address !== null) {
            const parts = [
                shipping_address.full_name,
                shipping_address.street,
                shipping_address.city,
                shipping_address.postal_code,
                shipping_address.country,
                shipping_address.phone ? `Tel: ${shipping_address.phone}` : null,
            ].filter(Boolean);
            formattedAddress = parts.join(', ');
        }

        if (!formattedAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address cannot be empty",
            });
        }

        // Execute the atomic transaction
        const result = executeOrderTransaction(req.user.id, formattedAddress);

        // Fetch complete created order to return to client
        const createdOrder = db
            .prepare(
                `SELECT id, user_id, total, status, shipping_address, created_at, updated_at
                 FROM orders
                 WHERE id = ?`
            )
            .get(result.orderId);

        const orderItems = db
            .prepare(
                `SELECT 
                    oi.id,
                    oi.order_id,
                    oi.product_id,
                    oi.quantity,
                    oi.price,
                    p.name AS product_name,
                    p.slug AS product_slug
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`
            )
            .all(result.orderId);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: {
                ...createdOrder,
                items: orderItems,
            },
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Error creating order:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error during order creation",
        });
    }
};

// =========================================
// GET /api/orders (List User Orders)
// =========================================
const getOrders = (req, res) => {
    try {
        const orders = db
            .prepare(
                `SELECT id, user_id, total, status, shipping_address, created_at, updated_at
                 FROM orders
                 WHERE user_id = ?
                 ORDER BY id DESC`
            )
            .all(req.user.id);

        // For each order, fetch items summary
        const getItems = db.prepare(
            `SELECT 
                oi.id,
                oi.order_id,
                oi.product_id,
                oi.quantity,
                oi.price,
                p.name AS product_name,
                p.slug AS product_slug
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`
        );

        const ordersWithItems = orders.map((order) => {
            const items = getItems.all(order.id);
            const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
            return {
                ...order,
                items_count: totalItemsCount,
                items,
            };
        });

        res.status(200).json({
            success: true,
            count: ordersWithItems.length,
            data: ordersWithItems,
        });
    } catch (error) {
        console.error("Error fetching orders:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// GET /api/orders/:id (Get Order Details)
// =========================================
const getOrderById = (req, res) => {
    try {
        const { id } = req.params;
        const orderId = Number(id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        // Must belong to authenticated user
        const order = db
            .prepare(
                `SELECT id, user_id, total, status, shipping_address, created_at, updated_at
                 FROM orders
                 WHERE id = ? AND user_id = ?`
            )
            .get(orderId, req.user.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const items = db
            .prepare(
                `SELECT 
                    oi.id,
                    oi.order_id,
                    oi.product_id,
                    oi.quantity,
                    oi.price,
                    (oi.quantity * oi.price) AS subtotal,
                    p.name AS product_name,
                    p.slug AS product_slug,
                    p.description AS product_description,
                    c.name AS category_name
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE oi.order_id = ?`
            )
            .all(orderId);

        const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

        res.status(200).json({
            success: true,
            data: {
                ...order,
                items_count: totalItemsCount,
                items,
            },
        });
    } catch (error) {
        console.error("Error fetching order details:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
};
