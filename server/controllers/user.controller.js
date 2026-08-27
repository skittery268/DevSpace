// Models
const User = require("../models/user.model");

// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// Modules
const crypto = require("crypto");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get all users
// GET /api/v1/users
const getUsers = catchAsync(async (req, res, next) => {
    const page = Math.max(1, Number(req.query.page)) || 1;
    const limit = Math.min(Number(req.query.limit), 100) || 12;

    const users = await User.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const userCount = await User.countDocuments({ isDeleted: { $ne: true } });

    res.status(200).json({
        status: "success",
        message: "Users returned successfully!",
        userCount,
        data: {
            users
        }
    });
});

// Controller to edit user
// PATCH /api/v1/users/fullname/:id
const editUserFullName = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { fullname } = req.body;

    if (!id) {
        return next(new AppError("Id is required!", 400));
    };

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    if (user.isDeleted) {
        return next(new AppError("This account is deleted!", 400));
    };

    if (req.user._id.toString() !== id.toString()) {
        return next(new AppError("You cant edit this account!", 403));
    };

    user.fullname = fullname;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Fullname changed successfully!"
    });
})

// Controller to send code in user email
// POST /api/v1/users/email/setup/:id
const editUserEmailSetup = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    if (user._id.toString() !== req.user._id.toString()) {
        return next(new AppError("Access denied!", 400));
    };

    await user.sendCode("email");

    res.status(200).json({
        status: "success",
        message: "Code sent in your email successfully!"
    });
});

// Controller to edit user
// PATCH /api/v1/users/email/verify
const editUserEmailVerify = catchAsync(async (req, res, next) => {
    const { email, code, password, newEmail } = req.body;

    const hashedCode = crypto
        .createHash("sha256")
        .update(String(code))
        .digest("hex");

    const user = await User.findOne({ email, changeEmailExpires: { $gt: Date.now() } }).select("+changeEmailAttempts +changeEmailCode +changeEmailExpires +password");

    if (!user) {
        return next(new AppError("Credentials Incorrect!", 400));
    };

    if (user._id.toString() !== req.user._id.toString()) {
        return next(new AppError("Access Denied!", 400));
    };

    const isValid = await user.comparePassword(password);

    if (!isValid) {
        return next(new AppError("Credentials Incorrect!", 400));
    };

    const existingUser = await User.findOne({
        email: newEmail
    });

    if (existingUser) {
        return next(new AppError("Unable to update email", 409));
    };

    if (user.changeEmailAttempts >= 5) {
        user.changeEmailCode = undefined;
        user.changeEmailExpires = undefined;

        await user.save();

        return next(new AppError("You reached attempt limit, resend code!", 400));
    };

    if (user.changeEmailCode.toString() !== hashedCode.toString()) {
        user.changeEmailAttempts++;

        await user.save();

        return next(new AppError("Code is incorrect!", 400));
    };

    user.email = newEmail;
    user.isVerified = false;

    await user.sendVerificationToken();

    user.changeEmailExpires = undefined;
    user.changeEmailCode = undefined;
    user.changeEmailAttempts = 0;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Email changed successfully!"
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
        return next(new AppError("You cant delete this account!", 403));
    };

    user.isDeleted = true;
    user.email = `deleted_${user._id}_${Date.now()}@deleted.local`;
    user.deletedAt = Date.now();

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Account deleted successfully!"
    });
});

module.exports = { getUsers, editUserFullName, editUserEmailSetup, editUserEmailVerify, deleteUser };