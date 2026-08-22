// modules
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Schema for order model
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required!"]
    },
    userInfo: {
        fullname: {
            type: String,
            required: [true, "User fullname is required!"]
        },
        email: {
            type: String,
            required: [true, "User email is required!"]
        },
        city: {
            type: String,
            required: [true, "User city is required!"]
        },
        country: {
            type: String,
            required: [true, "User country is required!"]
        },
        address: {
            type: String,
            required: [true, "User address is required!"]
        },
        phone: {
            type: String,
            required: [true, "User phone number is required!"]
        },
        zipcode: {
            type: String,
            required: [true, "Zipcode is required!"]
        }
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required!"]
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required!"]
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required!"]
        },
        itemTotal: {
            type: Number,
            required: [true, "Item total is required!"]
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required!"]
    },
    status: {
        type: String,
        enum: [
            "confirmed",
            "processing",
            "shipped",
            "delivered", 
            "completed",  
            "canceled",  
            "refunded",  
            "partially_refunded" 
        ],
        default: "confirmed"
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        required: [true, "Payment ID is required!"]
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;