// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// Models
const User = require("../models/user.model");

// -------------------------------------IMPORTS-------------------------------------

// Function to check user sanctions
const checkBan = catchAsync(async (req, res, next) => {
    const { user } = req;

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    const userActiveBan = user.moderation.activeBan;

    if (userActiveBan) {
        if (userActiveBan.expiresAt === null || userActiveBan.expiresAt > Date.now()) {
            return next(new AppError("Your account is banned!", 403));
        };

        user.moderation.activeBan = null;

        await user.save();
    };

    next();
});

module.exports = checkBan;