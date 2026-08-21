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
        return next(new AppError("Authorization token is required!", 400));
    };

    const payload = await jwt.verify(at, process.env.JWT_SECRET);

    if (!payload) {
        return next(new AppError("Invalid token!", 400));
    };

    if (payload.scope !== "session") {
        return next(new AppError("Invalid Token!", 400));
    }

    const user = await User.findById(payload.id);

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    req.user = user;

    next();
});

// Function to restrict routes
const allowedTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You haven't permission to this action!", 401));
        };

        next();
    };
};

module.exports = { protect, allowedTo };