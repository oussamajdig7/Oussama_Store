const db = require("../config/database");

// =========================================
// GET /api/products
// =========================================
const getAllProducts = (req, res) => {
    try {
        const products = db
            .prepare(
                `SELECT p.*, c.name AS category_name, c.slug AS category_slug
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 ORDER BY p.id DESC`
            )
            .all();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// GET /api/products/:id
// =========================================
const getProductById = (req, res) => {
    try {
        const { id } = req.params;

        const product = db
            .prepare(
                `SELECT p.*, c.name AS category_name, c.slug AS category_slug
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE p.id = ?`
            )
            .get(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// POST /api/products
// =========================================
const createProduct = (req, res) => {
    try {
        const { category_id, name, slug, description, price, stock } = req.body;

        // Validate required fields
        if (!category_id || !name || !slug || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: "Fields 'category_id', 'name', 'slug' and 'price' are required",
            });
        }

        // Validate price
        if (typeof price !== "number" || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a positive number",
            });
        }

        // Validate stock if provided
        if (stock !== undefined && stock !== null && (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock))) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer",
            });
        }

        // Verify category exists
        const category = db
            .prepare("SELECT id FROM categories WHERE id = ?")
            .get(category_id);

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category not found. Invalid category_id",
            });
        }

        const result = db
            .prepare(
                `INSERT INTO products (category_id, name, slug, description, price, stock)
                 VALUES (?, ?, ?, ?, ?, ?)`
            )
            .run(
                category_id,
                name,
                slug,
                description || null,
                price,
                stock !== undefined && stock !== null ? stock : 0
            );

        const newProduct = db
            .prepare(
                `SELECT p.*, c.name AS category_name, c.slug AS category_slug
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE p.id = ?`
            )
            .get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct,
        });
    } catch (error) {
        // Handle UNIQUE constraint violation on slug
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                success: false,
                message: "A product with this slug already exists",
            });
        }

        console.error("Error creating product:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// PUT /api/products/:id
// =========================================
const updateProduct = (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, slug, description, price, stock } = req.body;

        // Check if product exists
        const existing = db
            .prepare("SELECT * FROM products WHERE id = ?")
            .get(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Validate required fields
        if (!category_id || !name || !slug || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: "Fields 'category_id', 'name', 'slug' and 'price' are required",
            });
        }

        // Validate price
        if (typeof price !== "number" || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a positive number",
            });
        }

        // Validate stock if provided
        if (stock !== undefined && stock !== null && (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock))) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer",
            });
        }

        // Verify category exists
        const category = db
            .prepare("SELECT id FROM categories WHERE id = ?")
            .get(category_id);

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category not found. Invalid category_id",
            });
        }

        db.prepare(
            `UPDATE products
             SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`
        ).run(
            category_id,
            name,
            slug,
            description || null,
            price,
            stock !== undefined && stock !== null ? stock : 0,
            id
        );

        const updatedProduct = db
            .prepare(
                `SELECT p.*, c.name AS category_name, c.slug AS category_slug
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE p.id = ?`
            )
            .get(id);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct,
        });
    } catch (error) {
        // Handle UNIQUE constraint violation on slug
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                success: false,
                message: "A product with this slug already exists",
            });
        }

        console.error("Error updating product:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// DELETE /api/products/:id
// =========================================
const deleteProduct = (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const existing = db
            .prepare("SELECT * FROM products WHERE id = ?")
            .get(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        db.prepare("DELETE FROM products WHERE id = ?").run(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting product:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
