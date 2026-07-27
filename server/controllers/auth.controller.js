// Models
const User = require("../models/user.model");

// Modules
const jwt = require("jsonwebtoken");

// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// -------------------------------------IMPORTS-------------------------------------

// Function to create JWT token
const signToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
};

// Function to send JWT token
const createSendToken = (res, user) => {
    const token = signToken(user);

    res.cookie("lt", token, {
        maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_MODE === "prod",
        httpOnly: true,
        sameSite: process.env.NODE_MODE === "dev" ? "none" : "lax"
    });

    user.password = undefined;

    res.status(200).json({
        status: "success",
        message: "Login successfully!",
        data: {
            user
        }
    });
};

// Controller to register new user
// POST /api/v1/auth/register
const register = catchAsync(async (req, res, next) => {
    const { fullname, email, password } = req.body;

    const exist = await User.findOne({ email });

    if (exist) {
        return next(new AppError("User with this email already exists!", 400));
    };
    
    const user = await User.create({ fullname, email, password });

    res.status(201).json({
        status: "success",
        message: "User registered successfully!"
    });
});

// Controller to login user
// POST /api/v1/auth/login
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new AppError("Credentials incorrect!", 401));
    };

    const isValid = await user.comparePassword(password);

    if (!isValid) {
        return next(new AppError("Credentials incorrect!", 401));
    };

    createSendToken(res, user);
});

// Controller to logout user (clear cookies)
// DELETE /api/v1/auth/logout
const logout = catchAsync(async (req, res, next) => {
    res.clearCookie("lt", {
        secure: process.env.NODE_MODE === "prod",
        httpOnly: true,
        sameSite: process.env.NODE_MODE === "dev" ? "none" : "lax"
    });

    res.status(200).json({
        status: "success",
        message: "User logout successfully!"
    });
});

// Controller to auto login
// GET /api/v1/auth/me
const getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: "success",
        message: "Auto login successfully!",
        data: {
            user: req.user
        }
    });
});

// Controller to handle google authenticate
// GET /api/v1/auth/google/callback
const googleCallback = catchAsync(async (req, res, next) => {
    const token = signToken(req.user);

    res.cookie("lt", token, {
        maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_MODE === "prod",
        httpOnly: true,
        sameSite: process.env.NODE_MODE === "dev" ? "none" : "lax"
    });

    user.password = undefined;

    res.redirect(process.env.CLIENT_URL);
})

module.exports = { register, login, logout, getMe, googleCallback };