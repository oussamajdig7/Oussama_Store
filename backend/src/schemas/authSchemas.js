const { z } = require("zod");

/**
 * Validation schema for user registration.
 */
const registerSchema = z.object({
    name: z
        .string({ required_error: "Fields 'name', 'email' and 'password' are required" })
        .trim()
        .min(1, "Fields 'name', 'email' and 'password' are required")
        .max(100, "Name must not exceed 100 characters"),
    email: z
        .string({ required_error: "Fields 'name', 'email' and 'password' are required" })
        .trim()
        .email("Invalid email format")
        .max(255, "Email must not exceed 255 characters"),
    password: z
        .string({ required_error: "Fields 'name', 'email' and 'password' are required" })
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must not exceed 128 characters"),
});

/**
 * Validation schema for user login.
 */
const loginSchema = z.object({
    email: z
        .string({ required_error: "Fields 'email' and 'password' are required" })
        .trim()
        .email("Invalid email format"),
    password: z
        .string({ required_error: "Fields 'email' and 'password' are required" })
        .min(1, "Fields 'email' and 'password' are required"),
});

module.exports = {
    registerSchema,
    loginSchema,
};
