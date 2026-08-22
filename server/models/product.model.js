// Modules
const mongoose = require('mongoose');

// -------------------------------------IMPORTS-------------------------------------

// Schema for product model
const productSchema = new mongoose.Schema({
    universal: {
        title: {
            type: String,
            required: [true, "Title is required"]
        },
        description: {
            type: String,
            required: [true, "Description is required"]
        },
        price: {
            type: Number,
            required: [true, "Price is required"]
        },
        stock: {
            type: Number,
            default: 1
        },
        images: [{
            url: String,
            public_id: String
        }],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Caterogy is required!"]
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Seller ID is required!"]
        },
        reviewsCount: {
            type: Number,
            default: 0
        }
    },
    attributes: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

// Indexing
productSchema.index({ "universal.category": 1 });
productSchema.index({ "universal.sellerId": 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
