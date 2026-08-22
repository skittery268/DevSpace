// Modules
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Schema for review model
const reviewSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author ID is required!"]
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required!"]
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: [true, "Comment ID is required!"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Rating is required!"]
    }
}, { timestamps: true });

// Indexing
reviewSchema.index({ productId: 1 });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;