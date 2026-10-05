const { z } = require("zod");

/**
 * Validation schema for updating user role.
 */
const updateRoleSchema = z.object({
    role: z.enum(["user", "admin"], {
        errorMap: () => ({ message: "Role must be either 'user' or 'admin'" }),
    }),
});

/**
 * Validation schema for updating order status.
 */
const updateOrderStatusSchema = z.object({
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"], {
        errorMap: () => ({ message: "Invalid order status. Allowed: pending, processing, shipped, delivered, cancelled" }),
    }),
});

module.exports = {
    updateRoleSchema,
    updateOrderStatusSchema,
};
