// Modules
const { z } = require("zod");

// -------------------------------------IMPORTS-------------------------------------

// Schema to validate ban and warn user requests body
const banAndWarnUserSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(5, "Reason must be at least 5 characters!")
        .max(500, "Reason cannot exceed 500 characters!"),
    
    expiresAt: z
        .coerce.number()
        .int()
        .min(1, "ExpiresAt must be at least 1!")
        .optional()
}).strict({ message: "Unknown fields are not allowed!" });

// Schema to validate unban and unwarn user requests body
const unBanAndUnwarnUserSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(5, "Reason must be at least 5 characters!")
        .max(500, "Reason cannot exceed 500 characters!")
}).strict({ message: "Unknown fields are not allowed!" });

module.exports = { banAndWarnUserSchema, unBanAndUnwarnUserSchema };
