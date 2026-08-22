// Modules
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Schema for payment model
const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User id is required"],
    },
    stripeSessionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    stripePaymentIntentId: {
        type: String,
        unique: true,
        sparse: true,
    },
    totalAmount: {
        type: Number,
        required: [true, "Total amount of products is requried"]
    },
    stripeCustomerId: { 
        type: String 
    },
    transferGroup: {
        type: String
    },
    platformCommission: {
        type: Number,
        required: [true, "Platform commission is required"]
    },
    sellerNetAmount: {
        type: Number,
        required: [true, "Seller net amount is required"]
    },
    sellerDistributions: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Product ID is required for distribution"]
            },
            sellerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: [true, "Seller ID is required for distribution"]
            },
            quantity: {
                type: Number,
                required: [true, "Quantity is required for distribution"]
            },
            itemTotal: {
                type: Number,
                required: [true, "Item total is required for distribution"]
            },
            commission: {
                type: Number,
                required: [true, "Commission is required for distribution"]
            },
            sellerAmount: {
                type: Number,
                required: [true, "Seller amount is required for distribution"]
            }
        }
    ],
    status: {
        type: String,
        required: [true, "Payment status is required"],
        enum: ["pending", "succeeded", "failed", "canceled"],
        default: "pending"
    },
    webhookProcessed: {
        type: Boolean, 
        default: false
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
}, { timestamps: true });

// Indexing
paymentSchema.index({status: 1});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;