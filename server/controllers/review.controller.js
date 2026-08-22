// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// Models
const Comment = require("../models/comment.model");
const Review = require("../models/review.model");
const Product = require("../models/product.model");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get all product reviews
const getProductReviews = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    const reviews = await Review.find({ productId })
        .populate(["authorId", "commentId"])
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const reviewsCount = await Review.countDocuments({ productId });

    res.status(200).json({
        status: "success",
        message: "Product reviews returned successfully!",
        reviewsCount,
        data: {
            reviews
        }
    });
});

// Controller to create new review
const createReview = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { content, rating } = req.body;

    const authorId = req.user._id;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError("Product not found!", 404));
    };

    const comment = await Comment.create({ authorId, content });
    const review = await Review.create({ authorId, productId, commentId: comment._id, rating });

    product.universal.reviewsCount++;

    await product.save();
    await review.populate(["authorId", "commentId"]);

    res.status(201).json({
        status: "success",
        message: "Review created successfully!",
        data: {
            review
        }
    });
});

// Controller to delete review by id
const deleteReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    
    if (!review) {
        return next(new AppError("Review not found!", 404));
    };

    const product = await Product.findById(review.productId);

    if (!product) {
        return next(new AppError("Product not found!", 404));
    };

    if (review.authorId.toString() != req.user._id.toString() && req.user.role !== "admin") {
        return next(new AppError("You cant delete this review!", 401));
    };

    await Review.findByIdAndDelete(reviewId);

    product.universal.reviewsCount--;

    await product.save();

    res.status(200).json({
        status: "success",
        message: "Review deleted successfully!"
    });
});

// Controller to edit review by id
const editReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const { content, rating } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new AppError("Review not found!", 404));
    };

    if (review.authorId.toString() != req.user._id.toString()) {
        return next(new AppError("You cant edit this review!", 401));
    };

    if (rating) review.rating = rating;
    if (content) {
        const comment = await Comment.findById(review.commentId);

        if (!comment) {
            return next(new AppError("Comment not found!", 404));
        };

        comment.content = content;

        await comment.save();
    };

    await review.save();
    await review.populate(["authorId", "commentId"]);

    res.status(200).json({
        status: "success",
        message: "Information edited successfully!",
        data: {
            review
        }
    });
});

module.exports = { getProductReviews, createReview, deleteReview, editReview };