const { z } = require("zod");

const addressObjectSchema = z
    .object({
        full_name: z.string().trim().optional(),
        street: z.string().trim().optional(),
        city: z.string().trim().optional(),
        postal_code: z.string().trim().optional(),
        country: z.string().trim().optional(),
        phone: z.string().trim().optional(),
    })
    .passthrough();

/**
 * Validation schema for creating an order.
 * Accepts formatted address string or structured address object.
 */
const createOrderSchema = z.object({
    shipping_address: z.union(
        [
            z
                .string({ required_error: "Shipping address is required" })
                .trim()
                .min(5, "Shipping address must be at least 5 characters long")
                .max(500, "Shipping address must not exceed 500 characters"),
            addressObjectSchema,
        ],
        { required_error: "Shipping address is required" }
    ),
});

module.exports = {
    createOrderSchema,
};
