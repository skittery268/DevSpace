// Modules
const express = require("express");

// Controllers
const { getProductReviews, createReview, deleteReview, editReview } = require("../controllers/review.controller");

// Middlewares
const { protect } = require("../middlewares/auth.middleware");

// -------------------------------------IMPORTS-------------------------------------

const reviewRouter = express.Router();

// Route to get reviews by productId and query (page, limit)
reviewRouter.get("/:productId", getProductReviews);

// Middlewares
reviewRouter.use(protect);

// Route to create new review 
reviewRouter.post(
    "/:productId",
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
    editReview
);

module.exports = reviewRouter;