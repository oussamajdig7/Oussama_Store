const { z } = require("zod");

/**
 * Validation schema for creating a product.
 * Enforces positive prices and non-negative stock to prevent financial or inventory tampering.
 */
const createProductSchema = z.object({
    name: z
        .string({ required_error: "Product name is required" })
        .trim()
        .min(1, "Product name is required")
        .max(200, "Product name must not exceed 200 characters"),
    slug: z
        .string()
        .trim()
        .min(1, "Slug cannot be empty")
        .max(200, "Slug must not exceed 200 characters")
        .optional()
        .nullable(),
    description: z
        .string()
        .trim()
        .max(2000, "Description must not exceed 2000 characters")
        .optional()
        .nullable(),
    price: z.coerce
        .number({ invalid_type_error: "Price must be a valid number", required_error: "Product price is required" })
        .positive("Price must be a positive number"),
    stock: z.coerce
        .number({ invalid_type_error: "Stock must be an integer" })
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative")
        .default(0),
    category_id: z.coerce
        .number({ invalid_type_error: "Category ID must be a number", required_error: "Category ID is required" })
        .int("Category ID must be an integer")
        .positive("Category ID must be a positive integer"),
});

/**
 * Validation schema for updating a product.
 */
const updateProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Product name cannot be empty")
        .max(200, "Product name must not exceed 200 characters")
        .optional(),
    slug: z
        .string()
        .trim()
        .min(1, "Slug cannot be empty")
        .max(200, "Slug must not exceed 200 characters")
        .optional()
        .nullable(),
    description: z
        .string()
        .trim()
        .max(2000, "Description must not exceed 2000 characters")
        .optional()
        .nullable(),
    price: z.coerce
        .number({ invalid_type_error: "Price must be a valid number" })
        .positive("Price must be a positive number")
        .optional(),
    stock: z.coerce
        .number({ invalid_type_error: "Stock must be an integer" })
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative")
        .optional(),
    category_id: z.coerce
        .number({ invalid_type_error: "Category ID must be a number" })
        .int("Category ID must be an integer")
        .positive("Category ID must be a positive integer")
        .optional(),
});

/**
 * Validation schema for product query parameters (search, filter, pagination, sort).
 */
const productQuerySchema = z.object({
    page: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return 1;
        const num = parseInt(val, 10);
        return isNaN(num) || num < 1 ? 1 : num;
    }, z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return 12;
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) return 12;
        if (num > 100) return 100;
        return num;
    }, z.number().int().min(1).max(100).default(12)),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    minPrice: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        const num = Number(val);
        return isNaN(num) || num < 0 ? undefined : num;
    }, z.number().min(0).optional()),
    maxPrice: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        const num = Number(val);
        return isNaN(num) || num < 0 ? undefined : num;
    }, z.number().min(0).optional()),
    sort: z.preprocess((val) => {
        if (!val || typeof val !== "string") return undefined;
        const s = val.trim().toLowerCase();
        if (["newest", "oldest", "price_asc", "price_desc"].includes(s)) return s;
        return undefined;
    }, z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional()),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
};
