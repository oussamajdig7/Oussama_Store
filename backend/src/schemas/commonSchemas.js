const { z } = require("zod");

/**
 * Common parameter schemas for numeric route identifiers.
 */
const idParamSchema = z.object({
    id: z.coerce
        .number({ invalid_type_error: "ID must be a number" })
        .int("ID must be an integer")
        .positive("ID must be a positive integer"),
});

const productIdParamSchema = z.object({
    productId: z.coerce
        .number({ invalid_type_error: "Product ID must be a number" })
        .int("Product ID must be an integer")
        .positive("Product ID must be a positive integer"),
});

const productImageParamsSchema = z.object({
    id: z.coerce
        .number({ invalid_type_error: "Product ID must be a number" })
        .int("Product ID must be an integer")
        .positive("Product ID must be a positive integer"),
    imageId: z.coerce
        .number({ invalid_type_error: "Image ID must be a number" })
        .int("Image ID must be an integer")
        .positive("Image ID must be a positive integer"),
});

module.exports = {
    idParamSchema,
    productIdParamSchema,
    productImageParamsSchema,
};
