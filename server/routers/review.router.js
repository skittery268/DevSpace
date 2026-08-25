// Modules
const express = require("express");

// Controllers
const { getProductReviews, createReview, deleteReview, editReview } = require("../controllers/review.controller");

// Middlewares
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const checkBan = require("../middlewares/checkBan.middleware");

// Validators
const { createReviewSchema, editReviewSchema } = require("../validators/review.validator");

// -------------------------------------IMPORTS-------------------------------------

const reviewRouter = express.Router();

// Route to get reviews by productId and query (page, limit)
reviewRouter.get("/:productId", getProductReviews);

// Middlewares
reviewRouter.use(protect, checkBan);

// Route to create new review 
reviewRouter.post(
    "/:productId",
    validate(createReviewSchema),
    createReview
);
// Route to delete review by id
reviewRouter.delete(
    "/:reviewId",
    deleteReview
);
// Route to edit review information by id
reviewRouter.patch(
    "/:reviewId",
    validate(editReviewSchema),
    editReview
);

module.exports = reviewRouter;