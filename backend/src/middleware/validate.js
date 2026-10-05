const { z } = require("zod");

/**
 * Generic request validation middleware using Zod.
 * Validates request body, params, and/or query.
 *
 * @param {Object} schemas - Map of parts to validate: { body?: z.ZodSchema, params?: z.ZodSchema, query?: z.ZodSchema }
 * @returns {import('express').RequestHandler}
 */
const validate = (schemas) => {
    return (req, res, next) => {
        try {
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            next();
        } catch (error) {
            if (error instanceof z.ZodError || error.name === "ZodError") {
                const issues = error.issues || error.errors || [];
                const formattedErrors = issues.map((err) => ({
                    field: Array.isArray(err.path) ? err.path.join(".") : String(err.path || ""),
                    message: err.message,
                }));

                return res.status(400).json({
                    success: false,
                    message: formattedErrors[0]?.message || "Validation failed",
                    errors: formattedErrors,
                });
            }
            next(error);
        }
    };
};

module.exports = validate;
