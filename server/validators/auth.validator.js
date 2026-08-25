// Modules
const { z } = require("zod");

// -------------------------------------IMPORTS-------------------------------------

// Schema to validate register request body
const registerSchema = z.object({
    fullname: z
        .string()
        .trim()
        .min(5, "Fullname must be at least 5 characters!")
        .max(50, "Fullname cannot exceed 50 characters!"),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address!"),

    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters!")
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate login request body
const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address!"),

    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters!")
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate forgot password request body
const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address!")
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate reset password request body
const resetPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address!"),

    code: z
        .string()
        .trim(),

    newPassword: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters!")
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate setup 2FA request body
const setup2FASchema = z.object({
    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters!")
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate verify 2FA request body
const verify2FASchema = z.object({
    code: z
        .string()
        .trim()
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate disable 2FA request body
const disable2FASchema = z.object({
    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters!")
}).strict({ message: "Unknown fields are not allowed!" });

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    setup2FASchema,
    verify2FASchema,
    disable2FASchema
};