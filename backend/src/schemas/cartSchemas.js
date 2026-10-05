const { z } = require("zod");

/**
 * Validation schema for adding items to cart.
 * Strictly prevents negative or zero quantities.
 */
const addToCartSchema = z.object({
    product_id: z.coerce
        .number({ required_error: "Field 'product_id' is required", invalid_type_error: "'product_id' must be a number" })
        .int("'product_id' must be a valid positive integer")
        .positive("'product_id' must be a valid positive integer"),
    quantity: z.coerce
        .number({ invalid_type_error: "Quantity must be an integer" })
        .int("Quantity must be an integer")
        .min(1, "Quantity must be at least 1")
        .default(1),
});

/**
 * Validation schema for updating cart item quantity.
 * Prevents negative quantities. Quantity of 0 triggers item removal.
 */
const updateCartItemSchema = z.object({
    quantity: z.coerce
        .number({ required_error: "Field 'quantity' is required", invalid_type_error: "Quantity must be an integer" })
        .int("Quantity must be an integer")
        .min(0, "Quantity cannot be negative"),
});

module.exports = {
    addToCartSchema,
    updateCartItemSchema,
};
