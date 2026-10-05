const { z } = require("zod");

/**
 * Validation schema for adding to wishlist.
 */
const addToWishlistSchema = z.object({
    product_id: z.coerce
        .number({ required_error: "Field 'product_id' is required", invalid_type_error: "'product_id' must be a number" })
        .int("'product_id' must be a valid positive integer")
        .positive("'product_id' must be a valid positive integer"),
});

module.exports = {
    addToWishlistSchema,
};
