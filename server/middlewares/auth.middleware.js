// Models
const User = require("../models/user.model");

// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// Modules
const jwt = require("jsonwebtoken");

// -------------------------------------IMPORTS-------------------------------------

// Function to protect routes (check users tokens)
const protect = catchAsync(async (req, res, next) => {
    const { at } = req.cookies;

    if (!at) {
        return next(new AppError("Authorization token is required!", 401));
    };

    let payload = null;

    try {
        payload = await jwt.verify(at, process.env.JWT_SECRET);
    } catch (err) {
        return next(new AppError("Invalid or expired token!", 401));
    };

    if (payload.scope !== "session") {
        return next(new AppError("Invalid Token!", 401));
    }

    const user = await User.findById(payload.id).populate("moderation.activeBan");

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    if (user.isDeleted) {
        return next(new AppError("This account is deleted!", 401));
    };

    if (!user.isVerified) {
        return next(new AppError("Verify your account first!", 401));
    };

    req.user = user;

    next();
});

// Function to restrict routes
const allowedTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You haven't permission to this action!", 403));
        };

        next();
    };
};

module.exports = { protect, allowedTo };