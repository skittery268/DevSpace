// Services
const User = require("../models/user.model");
const { issueBanService, unBanService, issueWarningService, unWarnService, getActiveWarningsService } = require("../services/adminAction.service");
const AppError = require("../utils/appError.util");

// Utils
const catchAsync = require("../utils/catchAsync.util");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get all user active warnings
// GET /api/v1/admin/get-active-warnings/:userId
const getUserActiveWarnings = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const activeWarnings = await getActiveWarningsService(userId);

    res.status(200).json({
        status: "success",
        message: "User active warnings returned successfully!",
        data: {
            activeWarnings
        }
    });
});

// Controller to ban user
// POST /api/v1/admin/ban/:userId
const banUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { reason, expiresAt } = req.body;
    const adminId = req.user._id;

    if (userId.toString() === req.user._id.toString()) {
        return next(new AppError("You cant ban yourself!", 400));
    };

    const user = await User.findById(userId);
    
    if (!user) {
        return next(new AppError("User not found!", 404));
    };
    
    if (user.role === "admin") {
        return next(new AppError("You cant ban user with admin role!", 400));
    };

    const ban = await issueBanService(userId, adminId, reason, expiresAt);

    res.status(201).json({
        status: "success",
        message: "User banned successfully!",
        data: {
            ban
        }
    });
});

// Controller to unban user
// POST /api/v1/admin/unban/:userId/:banId
const unBanUser = catchAsync(async (req, res, next) => {
    const { userId, banId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    if (userId.toString() === req.user._id.toString()) {
        return next(new AppError("You cant unban yourself!", 400));
    };

    const user = await User.findById(userId);
    
    if (!user) {
        return next(new AppError("User not found!", 404));
    };
    
    if (user.role === "admin") {
        return next(new AppError("You cant unban user with admin role!", 400));
    };

    const unBan = await unBanService(userId, adminId, reason, banId);

    res.status(201).json({
        status: "success",
        message: "User unbanned successfully!",
        data: {
            unBan
        }
    });
});

// Controller to warn user
// POST /api/v1/admin/warn/:userId
const warnUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { reason, expiresAt } = req.body;
    const adminId = req.user._id;

    if (userId.toString() === req.user._id.toString()) {
        return next(new AppError("You cant warn yourself!", 400));
    };

    const user = await User.findById(userId);
    
    if (!user) {
        return next(new AppError("User not found!", 404));
    };
    
    if (user.role === "admin") {
        return next(new AppError("You cant warn user with admin role!", 400));
    };

    const warn = await issueWarningService(userId, adminId, reason, expiresAt);

    res.status(201).json({
        status: "success",
        message: "User warned successfully!",
        data: {
            warn
        }
    });
});

// Controller to unwarn user
// POST /api/v1/admin/unwarn/:userId/:warnId
const unWarnUser = catchAsync(async (req, res, next) => {
    const { userId, warnId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    if (userId.toString() === req.user._id.toString()) {
        return next(new AppError("You cant unwarn yourself!", 400));
    };

    const user = await User.findById(userId);
    
    if (!user) {
        return next(new AppError("User not found!", 404));
    };
    
    if (user.role === "admin") {
        return next(new AppError("You cant unwarn user with admin role!", 400));
    };

    const unWarn = await unWarnService(userId, adminId, reason, warnId);

    res.status(201).json({
        status: "success",
        message: "User unwarned successfully!",
        data: {
            unWarn
        }
    });
});

module.exports = { 
    getUserActiveWarnings,
    banUser,
    unBanUser,
    warnUser,
    unWarnUser
};