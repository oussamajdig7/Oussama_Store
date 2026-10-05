const { z } = require("zod");

/**
 * Validation schema for creating a category.
 */
const createCategorySchema = z.object({
    name: z
        .string({ required_error: "Category name is required" })
        .trim()
        .min(1, "Category name is required")
        .max(100, "Category name must not exceed 100 characters"),
    slug: z
        .string()
        .trim()
        .max(100, "Slug must not exceed 100 characters")
        .optional()
        .nullable(),
});

/**
 * Validation schema for updating a category.
 */
const updateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Category name cannot be empty")
        .max(100, "Category name must not exceed 100 characters")
        .optional(),
    slug: z
        .string()
        .trim()
        .max(100, "Slug must not exceed 100 characters")
        .optional()
        .nullable(),
});

module.exports = {
    createCategorySchema,
    updateCategorySchema,
};
