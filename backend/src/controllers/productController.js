const db = require("../config/database");

// =========================================
// GET /api/products
// =========================================
const getAllProducts = (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sort, page, limit } = req.query;

        // 1 & 2. Validate page and limit (Requirements 1, 2, 3)
        let pageNum = parseInt(page, 10);
        if (isNaN(pageNum) || pageNum < 1) {
            pageNum = 1;
        }

        let limitNum = parseInt(limit, 10);
        if (isNaN(limitNum) || limitNum < 1) {
            limitNum = 12; // Default limit
        }

        // 3. Set a reasonable maximum limit (Requirement 3)
        const MAX_LIMIT = 100;
        if (limitNum > MAX_LIMIT) {
            limitNum = MAX_LIMIT;
        }

        let baseSql = `
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
        `;

        const conditions = [];
        const params = [];

        // Search product name and description (parameterized)
        if (search && typeof search === "string" && search.trim() !== "") {
            conditions.push("(p.name LIKE ? OR (p.description IS NOT NULL AND p.description LIKE ?))");
            const term = `%${search.trim()}%`;
            params.push(term, term);
        }

        // Filter by category (slug or id)
        if (category && typeof category === "string" && category.trim() !== "" && category.toLowerCase() !== "all") {
            const catVal = category.trim();
            if (/^\d+$/.test(catVal)) {
                conditions.push("(p.category_id = ? OR c.slug = ?)");
                params.push(Number(catVal), catVal);
            } else {
                conditions.push("(c.slug = ? OR LOWER(c.name) = ?)");
                params.push(catVal.toLowerCase(), catVal.toLowerCase());
            }
        }

        // Filter by price range: minPrice
        if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
            const min = Number(minPrice);
            if (!isNaN(min) && min >= 0) {
                conditions.push("p.price >= ?");
                params.push(min);
            }
        }

        // Filter by price range: maxPrice
        if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
            const max = Number(maxPrice);
            if (!isNaN(max) && max >= 0) {
                conditions.push("p.price <= ?");
                params.push(max);
            }
        }

        let whereClause = "";
        if (conditions.length > 0) {
            whereClause = " WHERE " + conditions.join(" AND ");
        }

        // 4. Calculate total count for pagination metadata
        const countSql = `SELECT COUNT(*) AS total ${baseSql} ${whereClause}`;
        const countResult = db.prepare(countSql).get(...params);
        const total = countResult ? countResult.total : 0;
        const totalPages = Math.max(1, Math.ceil(total / limitNum));

        // Adjust pageNum if requested page exceeds totalPages (optional safety, or keep user page)
        const offset = (pageNum - 1) * limitNum;

        // Sorting: price_asc, price_desc, newest, oldest
        let orderClause = "ORDER BY p.id DESC"; // Default newest
        if (sort && typeof sort === "string") {
            switch (sort.trim().toLowerCase()) {
                case "price_asc":
                    orderClause = "ORDER BY p.price ASC, p.id DESC";
                    break;
                case "price_desc":
                    orderClause = "ORDER BY p.price DESC, p.id DESC";
                    break;
                case "oldest":
                    orderClause = "ORDER BY p.id ASC";
                    break;
                case "newest":
                default:
                    orderClause = "ORDER BY p.id DESC";
                    break;
            }
        }

        // 4. Use SQL LIMIT and OFFSET (Requirement 4)
        const selectSql = `
            SELECT p.*, c.name AS category_name, c.slug AS category_slug
            ${baseSql}
            ${whereClause}
            ${orderClause}
            LIMIT ? OFFSET ?
        `;

        const queryParams = [...params, limitNum, offset];
        const products = db.prepare(selectSql).all(...queryParams);

        const getImagesStmt = db.prepare(
            "SELECT id, product_id, image_url FROM product_images WHERE product_id = ? ORDER BY id ASC"
        );

        const productsWithImages = products.map((prod) => {
            const images = getImagesStmt.all(prod.id);
            return {
                ...prod,
                images,
                primary_image: images.length > 0 ? images[0].image_url : null,
            };
        });

        // Response structure strictly honoring Phase 15 requirements
        res.status(200).json({
            success: true,
            data: productsWithImages,
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            count: productsWithImages.length,
            filters: {
                search: search || null,
                category: category || null,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                sort: sort || "newest",
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error fetching products",
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

        const images = db
            .prepare(
                "SELECT id, product_id, image_url FROM product_images WHERE product_id = ? ORDER BY id ASC"
            )
            .all(id);

        res.status(200).json({
            success: true,
            data: {
                ...product,
                images,
                primary_image: images.length > 0 ? images[0].image_url : null,
            },
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
