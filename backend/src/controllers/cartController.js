const db = require("../config/database");

/**
 * Helper to fetch complete cart data for a user with calculated subtotals and total.
 */
const getCartDataForUser = (userId) => {
    const items = db
        .prepare(
            `SELECT 
                c.id,
                c.user_id,
                c.product_id,
                c.quantity,
                p.name AS product_name,
                p.slug AS product_slug,
                p.description AS product_description,
                p.price AS unit_price,
                p.stock AS product_stock,
                cat.name AS category_name
             FROM cart_items c
             JOIN products p ON c.product_id = p.id
             LEFT JOIN categories cat ON p.category_id = cat.id
             WHERE c.user_id = ?
             ORDER BY c.id DESC`
        )
        .all(userId);

    const formattedItems = items.map((item) => {
        const subtotal = Math.round(item.quantity * item.unit_price * 100) / 100;
        return {
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal,
            product: {
                id: item.product_id,
                name: item.product_name,
                slug: item.product_slug,
                description: item.product_description,
                price: item.unit_price,
                stock: item.product_stock,
                category_name: item.category_name,
            },
        };
    });

    const total = Math.round(
        formattedItems.reduce((acc, curr) => acc + curr.subtotal, 0) * 100
    ) / 100;

    const total_quantity = formattedItems.reduce(
        (acc, curr) => acc + curr.quantity,
        0
    );

    return {
        items: formattedItems,
        total_quantity,
        total,
    };
};

// =========================================
// GET /api/cart
// =========================================
const getCart = (req, res) => {
    try {
        const cartData = getCartDataForUser(req.user.id);

        res.status(200).json({
            success: true,
            count: cartData.items.length,
            data: cartData,
        });
    } catch (error) {
        console.error("Error fetching cart:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// POST /api/cart
// =========================================
const addToCart = (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        // 1. Validate product_id
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: "Field 'product_id' is required",
            });
        }

        const productIdNum = Number(product_id);
        if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "'product_id' must be a valid positive integer",
            });
        }

        // 2. Validate quantity is a positive integer
        const qtyNum = Number(quantity);
        if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        // 3. Verify product exists and get current price & stock from DATABASE (never trust frontend prices)
        const product = db
            .prepare("SELECT id, name, price, stock FROM products WHERE id = ?")
            .get(productIdNum);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 4. Check available stock
        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock",
            });
        }

        // 5. Check if item already exists in user's cart
        const existingItem = db
            .prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?")
            .get(req.user.id, productIdNum);

        let cartItemId;
        let finalQuantity;

        if (existingItem) {
            finalQuantity = existingItem.quantity + qtyNum;

            if (finalQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add requested quantity. Stock limit is ${product.stock} (${existingItem.quantity} already in your cart)`,
                });
            }

            db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(
                finalQuantity,
                existingItem.id
            );
            cartItemId = existingItem.id;
        } else {
            finalQuantity = qtyNum;

            if (finalQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Requested quantity (${qtyNum}) exceeds available stock (${product.stock})`,
                });
            }

            const insertResult = db
                .prepare(
                    "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)"
                )
                .run(req.user.id, productIdNum, finalQuantity);

            cartItemId = insertResult.lastInsertRowid;
        }

        const cartData = getCartDataForUser(req.user.id);

        res.status(201).json({
            success: true,
            message: existingItem
                ? "Product quantity updated in cart"
                : "Product added to cart",
            data: {
                cart_item_id: cartItemId,
                product_id: productIdNum,
                quantity: finalQuantity,
                cart: cartData,
            },
        });
    } catch (error) {
        console.error("Error adding to cart:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// PUT /api/cart/:id
// =========================================
const updateCartItem = (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const cartItemId = Number(id);
        if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID",
            });
        }

        // Validate quantity is a positive integer
        if (quantity === undefined || quantity === null) {
            return res.status(400).json({
                success: false,
                message: "Field 'quantity' is required",
            });
        }

        const qtyNum = Number(quantity);
        if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        // Verify cart item exists and belongs to the authenticated user
        const cartItem = db
            .prepare(
                `SELECT c.id, c.user_id, c.product_id, c.quantity, p.stock, p.price, p.name
                 FROM cart_items c
                 JOIN products p ON c.product_id = p.id
                 WHERE c.id = ? AND c.user_id = ?`
            )
            .get(cartItemId, req.user.id);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found in your cart",
            });
        }

        // Validate stock
        if (qtyNum > cartItem.stock) {
            return res.status(400).json({
                success: false,
                message: `Quantity (${qtyNum}) exceeds available stock (${cartItem.stock})`,
            });
        }

        db.prepare(
            "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?"
        ).run(qtyNum, cartItemId, req.user.id);

        const cartData = getCartDataForUser(req.user.id);

        res.status(200).json({
            success: true,
            message: "Cart item quantity updated successfully",
            data: {
                cart_item_id: cartItemId,
                quantity: qtyNum,
                cart: cartData,
            },
        });
    } catch (error) {
        console.error("Error updating cart item:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// DELETE /api/cart/:id
// =========================================
const removeCartItem = (req, res) => {
    try {
        const { id } = req.params;

        const cartItemId = Number(id);
        if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID",
            });
        }

        // Verify cart item exists and belongs to the authenticated user
        const cartItem = db
            .prepare("SELECT id FROM cart_items WHERE id = ? AND user_id = ?")
            .get(cartItemId, req.user.id);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found in your cart",
            });
        }

        db.prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?").run(
            cartItemId,
            req.user.id
        );

        const cartData = getCartDataForUser(req.user.id);

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            data: cartData,
        });
    } catch (error) {
        console.error("Error removing cart item:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// DELETE /api/cart (Clear Cart)
// =========================================
const clearCart = (req, res) => {
    try {
        db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(req.user.id);

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: {
                items: [],
                total_quantity: 0,
                total: 0,
            },
        });
    } catch (error) {
        console.error("Error clearing cart:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};
