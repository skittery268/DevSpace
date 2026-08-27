// Modules
const { z } = require("zod");

// -------------------------------------IMPORTS-------------------------------------

// Schema to validate edit user fullname request body
const editUserFullNameSchema = z.object({
    fullname: z
        .string()
        .trim()
        .min(5, "Fullname must be at least 5 characters!")
        .max(50, "Fullname cannot exceed 50 characters!")
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate edit user email request body
const editUserEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address!"),

    code: z
        .string()
        .trim(),

    password: z
        .string()
        .trim()
        .min(8, "Password must be at least 8 characters!"),

    newEmail: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address!"),
}).strict({ message: "Unknown fields are not allowed!" });

module.exports = {
    editUserFullNameSchema,
    editUserEmailSchema
};