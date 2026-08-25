// Modules
const { z } = require("zod");

// -------------------------------------IMPORTS-------------------------------------

// Schema for validate create product requests body
const createProductSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, { message: "Product title must contain at least 5 characters!" })
        .max(100, { message: "Product title is too long!" }),
    description: z
        .string()
        .trim()
        .min(10, { message: "Product description must contain at least 10 characters!" })
        .max(1000, { message: "Product description is too long!" }),
    price: z
        .coerce
        .number()
        .positive({ message: "Product price must be a positive number!" })
        .min(1, { message: "Product price must be at least 1!" }),
    stock: z
        .coerce
        .number()
        .min(1, { message: "Product stock must be at least 1!" }),
    attributes: z
        .record(z.string())
        .optional()

}).strict({ message: "Unknown fields are not allowed!" });

// Schema for validate edit product requests body
const editProductSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, { message: "Product title must contain at least 5 characters!" })
        .max(100, { message: "Product title is too long!" })
        .optional(),
    description: z
        .string()
        .trim()
        .min(10, { message: "Product description must contain at least 10 characters!" })
        .max(1000, { message: "Product description is too long!" })
        .optional(),
    price: z
        .coerce
        .number()
        .positive({ message: "Product price must be a positive number!" })
        .min(1, { message: "Product price must be at least 1!" })
        .optional(),
    stock: z
        .coerce
        .number()
        .positive({ message: "Product stock must be a positive number!" })
        .min(1, { message: "Product stock must be at least 1!" })
        .optional(),
    attributes: z
        .record(z.string())
        .optional()

}).strict({ message: "Unknown fields are not allowed!" });

module.exports = { 
    createProductSchema, 
    editProductSchema 
};
