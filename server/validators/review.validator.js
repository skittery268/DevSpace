// Modules
const { z } = require("zod");

// -------------------------------------IMPORTS-------------------------------------

// Schema to validate create review request body
const createReviewSchema = z.object({
    content: z
        .string()
        .trim()
        .min(5, "Review content must be at least 5 characters!")
        .max(500, "Review content cannot exceed 500 characters!"),

    rating: z
        .number()
        .int("Rating must be an integer!")
        .min(1, "Rating must be at least 1!")
        .max(5, "Rating cannot be greater than 5!")
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate edit review request body
const editReviewSchema = z.object({
    content: z
        .string()
        .trim()
        .min(5, "Review content must be at least 5 characters!")
        .max(500, "Review content cannot exceed 500 characters!")
        .optional(),

    rating: z
        .number()
        .int("Rating must be an integer!")
        .min(1, "Rating must be at least 1!")
        .max(5, "Rating cannot be greater than 5!")
        .optional()
}).strict({ message: "Unknown fields are not allowed!" });

module.exports = { 
    createReviewSchema,
    editReviewSchema
};