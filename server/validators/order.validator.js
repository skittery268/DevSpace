// Modules
const { z } = require("zod");

// -------------------------------------IMPORTS-------------------------------------

// Schema to validate change order status request body
const changeStatusSchema = z.object({
    status: z
        .enum([
            "confirmed",
            "processing",
            "shipped",
            "delivered", 
            "completed",  
            "canceled",  
            "refunded",  
            "partially_refunded" 
        ], { message: "Invalid order status!" })
}).strict({ message: "Unknown fields are not allowed!" });

module.exports = { changeStatusSchema };