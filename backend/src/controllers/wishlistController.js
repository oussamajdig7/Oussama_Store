const db = require("../config/database");

/**
 * Helper to fetch formatted wishlist items for a user.
 */
const getWishlistForUser = (userId) => {
    const items = db
        .prepare(
            `SELECT 
                w.id AS wishlist_id,
                w.user_id,
                w.product_id,
                p.name AS product_name,
                p.slug AS product_slug,
                p.description AS product_description,
                p.price,
                p.stock,
                c.name AS category_name,
                c.slug AS category_slug
             FROM wishlists w
             JOIN products p ON w.product_id = p.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE w.user_id = ?
             ORDER BY w.id DESC`
        )
        .all(userId);

    return items.map((item) => ({
        id: item.wishlist_id,
        user_id: item.user_id,
        product_id: item.product_id,
        product: {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            description: item.product_description,
            price: item.price,
            stock: item.stock,
            category_name: item.category_name,
            category_slug: item.category_slug,
        },
    }));
};

// =========================================
// GET /api/wishlist
// =========================================
const getWishlist = (req, res) => {
    try {
        const wishlistItems = getWishlistForUser(req.user.id);

        res.status(200).json({
            success: true,
            count: wishlistItems.length,
            data: wishlistItems,
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// POST /api/wishlist
// =========================================
const addToWishlist = (req, res) => {
    try {
        const { product_id } = req.body;

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

        // 2. Validate product exists in database
        const product = db
            .prepare(
                `SELECT p.*, c.name AS category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.id = ?`
            )
            .get(productIdNum);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 3. Prevent duplicate wishlist entries
        const existingEntry = db
            .prepare(
                "SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?"
            )
            .get(req.user.id, productIdNum);

        if (existingEntry) {
            return res.status(409).json({
                success: false,
                message: "Product is already in your wishlist",
            });
        }

        // 4. Insert into wishlists
        const result = db
            .prepare(
                "INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)"
            )
            .run(req.user.id, productIdNum);

        res.status(201).json({
            success: true,
            message: "Product added to wishlist",
            data: {
                id: result.lastInsertRowid,
                user_id: req.user.id,
                product_id: productIdNum,
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    category_name: product.category_name,
                },
            },
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// DELETE /api/wishlist/:productId
// =========================================
const removeFromWishlist = (req, res) => {
    try {
        const { productId } = req.params;

        const productIdNum = Number(productId);
        if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // Check if the item exists in the user's wishlist (check by product_id or wishlist id)
        const entry = db
            .prepare(
                "SELECT id FROM wishlists WHERE user_id = ? AND (product_id = ? OR id = ?)"
            )
            .get(req.user.id, productIdNum, productIdNum);

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "Product not found in your wishlist",
            });
        }

        db.prepare(
            "DELETE FROM wishlists WHERE id = ?"
        ).run(entry.id);

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            data: {
                removed_id: entry.id,
                product_id: productIdNum,
            },
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};
