const db = require("../config/database");

// =========================================
// GET /api/categories
// =========================================
const getAllCategories = (req, res) => {
    try {
        const categories = db
            .prepare("SELECT * FROM categories ORDER BY id DESC")
            .all();

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// GET /api/categories/:id
// =========================================
const getCategoryById = (req, res) => {
    try {
        const { id } = req.params;

        const category = db
            .prepare("SELECT * FROM categories WHERE id = ?")
            .get(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error("Error fetching category:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// POST /api/categories
// =========================================
const createCategory = (req, res) => {
    try {
        const { name, slug } = req.body;

        // Validate required fields
        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Fields 'name' and 'slug' are required",
            });
        }

        const result = db
            .prepare("INSERT INTO categories (name, slug) VALUES (?, ?)")
            .run(name, slug);

        const newCategory = db
            .prepare("SELECT * FROM categories WHERE id = ?")
            .get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (error) {
        // Handle UNIQUE constraint violation on slug
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                success: false,
                message: "A category with this slug already exists",
            });
        }

        console.error("Error creating category:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// PUT /api/categories/:id
// =========================================
const updateCategory = (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;

        // Check if category exists
        const existing = db
            .prepare("SELECT * FROM categories WHERE id = ?")
            .get(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Validate required fields
        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Fields 'name' and 'slug' are required",
            });
        }

        db.prepare(
            "UPDATE categories SET name = ?, slug = ? WHERE id = ?"
        ).run(name, slug, id);

        const updatedCategory = db
            .prepare("SELECT * FROM categories WHERE id = ?")
            .get(id);

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
        });
    } catch (error) {
        // Handle UNIQUE constraint violation on slug
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                success: false,
                message: "A category with this slug already exists",
            });
        }

        console.error("Error updating category:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =========================================
// DELETE /api/categories/:id
// =========================================
const deleteCategory = (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const existing = db
            .prepare("SELECT * FROM categories WHERE id = ?")
            .get(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        db.prepare("DELETE FROM categories WHERE id = ?").run(id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting category:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
