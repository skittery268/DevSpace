// Modules
const { z } = require("zod");

// -------------------------------------IMPORTS-------------------------------------

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
    .optional();
 
// Schema to validate create category request body
const createCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(5, "Category name must be at least 5 characters!")
        .max(50, "Category name cannot exceed 50 characters!"),

    description: z
        .string()
        .trim()
        .min(5, "Category description must be at least 5 characters!")
        .max(300, "Category description cannot exceed 300 characters!"),

    allowedAttributes: z
        .array( z
            .string()
            .trim()
        ),
    
    parentCategory: objectId
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate edit category request body
const editCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(5, "Category name must be at least 5 characters!")
        .max(50, "Category name cannot exceed 50 characters!")
        .optional(),

    description: z
        .string()
        .trim()
        .min(5, "Category description must be at least 5 characters!")
        .max(300, "Category description cannot exceed 300 characters!")
        .optional(),

    allowedAttributes: z
        .array( z
            .string()
            .trim()
        )
        .optional(),
    
    parentCategory: objectId
}).strict({ message: "Unknown fields are not allowed!" });

module.exports = {
    createCategorySchema,
    editCategorySchema
};