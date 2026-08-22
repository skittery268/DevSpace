// Models
const User = require("../models/user.model");

// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get all users
// GET /api/v1/users
const getUsers = catchAsync(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    const users = await User.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const userCount = await User.countDocuments();

    res.status(200).json({
        status: "success",
        message: "Users returned successfully!",
        userCount,
        data: {
            users
        }
    });
});

// Controller to delete user (soft delete)
// DELETE /api/v1/users/:id
const deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError("Id is required!", 400));
    };

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    if (user.isDeleted) {
        return next(new AppError("This account is already deleted!", 400));
    };

    if (req.user._id.toString() !== id.toString() && req.user.role !== "admin") {
        return next(new AppError("You cant delete this account!", 401));
    };

    user.isDeleted = true;
    user.deletedAt = Date.now();

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Account deleted successfully!"
    });
});

module.exports = { getUsers, deleteUser };