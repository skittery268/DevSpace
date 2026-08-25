// Modules
const { z } = require("zod");

// -------------------------------------IMPORTS-------------------------------------

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

// Schema to validate create checkout session request body
const createCheckoutSessionSchema = z.object({
    userOrder: z
        .array(z.object({
            id: objectId,

            quantity: z
                .number()
                .int("Quantity must be an integer!")
                .positive("Quantity must be greater than 0!")
        }))
        .min(1, "Order is empty!"),

    userInfo: z.object({
        fullname: z
            .string()
            .trim()
            .min(5, "Fullname must be at least 5 characters!")
            .max(50, "Fullname cannot exceed 50 characters!"),

        email: z
            .string()
            .trim()
            .toLowerCase()
            .min(3, "Email must be at least 3 characters!")
            .email("Invalid email address!"),

        city: z
            .string()
            .trim()
            .min(1, "City must be at least 1 characters!"),

        country: z
            .string()
            .trim()
            .min(1, "Country must be at least 1 characters!"),

        address: z
            .string()
            .trim()
            .min(1, "Address must be at least 1 characters!"),

        phone: z
            .string()
            .trim()
            .min(1, "Phone must be at least 1 characters!"),

        zipcode: z
            .string()
            .trim()
            .min(1, "Zip code must be at least 1 characters!")
    })
}).strict({ message: "Unknown fields are not allowed!" });

module.exports = { createCheckoutSessionSchema };
