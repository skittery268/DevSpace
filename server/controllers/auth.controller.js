// Models
const User = require("../models/user.model");

// Modules
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const otplib = require("otplib");
const QRCode = require("qrcode");

// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// -------------------------------------IMPORTS-------------------------------------

// Function to create JWT token
const signToken = (user) => {
    return jwt.sign({ id: user._id, scope: "session" }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
};

// Function to send JWT token
const createSendToken = (res, user) => {
    const token = signToken(user);

    res.cookie("at", token, {
        maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_MODE === "prod",
        httpOnly: true,
        sameSite: process.env.NODE_MODE === "dev" ? "lax" : "lax"
    });

    user.password = undefined;
    user.twoFactorSecret = undefined;

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
    
    if (!fullname || !email || !password) {
        return next(new AppError("All fields is required!", 400));
    };

    const exist = await User.findOne({ email });

    if (exist) {
        return next(new AppError("User with this email already exists!", 400));
    };

    const user = await User.create({ fullname, email, password });

    await user.sendVerificationToken();

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

    if (!user.isVerified) {
        return next(new AppError("Verify your email first!", 400));
    };

    if (user.isDeleted) {
        return next(new AppError("This account deleted!", 400));
    };

    if (user.twoFactorEnabled) {
        const token = jwt.sign({ id: user._id, scope: "2fa" }, process.env.JWT_SECRET, { expiresIn: process.env.TWO_FA_JWT_EXPIRES });

        res.cookie("twoFA", token, {
            maxAge: process.env.TWO_FA_COOKIE_EXPIRES * 60 * 1000,
            secure: process.env.NODE_MODE === "prod",
            httpOnly: true,
            sameSite: process.env.NODE_MODE === "dev" ? "lax" : "lax"
        });

        return res.status(200).json({
            status: "success",
            requires2FA: true
        });
    };

    createSendToken(res, user);
});

// Controller to logout user (clear cookies)
// DELETE /api/v1/auth/logout
const logout = catchAsync(async (req, res, next) => {
    res.clearCookie("at", {
        secure: process.env.NODE_MODE === "prod",
        httpOnly: true,
        sameSite: process.env.NODE_MODE === "dev" ? "lax" : "lax"
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
    if (req.user.isDeleted) {
        return next(new AppError("This account is deleted!", 400));
    };
    
    if (req.user.twoFactorEnabled) {
        const token = jwt.sign({ id: req.user._id, scope: "2fa" }, process.env.JWT_SECRET, { expiresIn: process.env.TWO_FA_JWT_EXPIRES });

        res.cookie("twoFA", token, {
            maxAge: process.env.TWO_FA_COOKIE_EXPIRES * 60 * 1000,
            secure: process.env.NODE_MODE === "prod",
            httpOnly: true,
            sameSite: process.env.NODE_MODE === "dev" ? "lax" : "lax"
        });

        return res.redirect(`${process.env.CLIENT_URL}?requires2FA=true`);
    };

    const token = signToken(req.user);

    res.cookie("at", token, {
        maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_MODE === "prod",
        httpOnly: true,
        sameSite: process.env.NODE_MODE === "dev" ? "lax" : "lax"
    });

    req.user.password = undefined;

    res.redirect(process.env.CLIENT_URL);
});

// Controller to verify user email
// GET /api/v1/auth/verify-email
const verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.query;

    if (!token) {
        return next(new AppError("Token is required!", 400));
    };

    const payload = await jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
        return next(new AppError("Token invalid or expired!", 400));
    };

    const user = await User.findById(payload.id);

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    if (user.isVerified) {
        return next(new AppError("Your account is already verified!", 400));
    };

    user.isVerified = true;

    await user.save();

    res.redirect(process.env.CLIENT_URL);
});

// Controller to send reset password code in user email
// POST /api/v1/auth/forgot-password
const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required!", 400));
    };

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({
            status: "success",
            message: "Code send in your email!"
        })
    };

    await user.sendResetPasswordCode();

    res.status(200).json({
        status: "success",
        message: "Code send in your email!"
    });
});

// Controller to reset user password if code is correct
// POST /api/v1/auth/reset-password
const resetPassword = catchAsync(async (req, res, next) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return next(new AppError("All fields is required!", 400));
    };

    const hashedCode = crypto
        .createHash("sha256")
        .update(String(code))
        .digest("hex");

    const user = await User.findOne({ email, resetPasswordExpires: { $gt: Date.now() } }).select("+resetPasswordAttempts +passwordResetCode +resetPasswordExpires");

    if (!user) {
        return next(new AppError("Credentials Incorrect!", 404));
    };

    if (user.resetPasswordAttempts >= 5) {
        user.passwordResetCode = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return next(new AppError("You reached attempt limit, resend reset code!", 400));
    };

    if (user.passwordResetCode.toString() !== hashedCode.toString()) {
        user.resetPasswordAttempts++;

        await user.save();

        return next(new AppError("Code is incorrect!", 400));
    };

    user.password = newPassword;
    user.resetPasswordExpires = undefined;
    user.passwordResetCode = undefined;
    user.resetPasswordAttempts = undefined;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Password changed successfully!"
    });
});

// Controller to setup 2FA in authenticator application
// POST /api/v1/auth/2fa/setup
const setup2FA = catchAsync(async (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        return next(new AppError("Password is required!", 400));
    };

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    const isValid = await user.comparePassword(password);

    if (!isValid) {
        return next(new AppError("Password is incorrect!", 400));
    };

    if (user.twoFactorEnabled) {
        return next(new AppError("2FA is already enabled!", 400));
    };

    const secret = otplib.generateSecret();

    const uri = otplib.generateURI({
        issuer: "DevSpace",
        label: user.email,
        secret
    });

    const qrcode = await QRCode.toDataURL(uri);

    user.twoFactorSecret = secret;

    await user.save();

    res.status(200).json({
        status: "success",
        qrcode
    });
});

// Controller to verify setup 2FA authentication
// POST /api/v1/auth/2fa/verify-setup
const verify2FASetup = catchAsync(async (req, res, next) => {
    const { code } = req.body;

    const user = await User.findById(req.user._id).select("+twoFactorSecret");

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    if (user.twoFactorEnabled) {
        return next(new AppError("2FA authentication is already activated!", 400));
    };

    if (!user.twoFactorSecret) {
        return next(new AppError("2FA setup has not been started!", 400));
    };

    const result = await otplib.verify({
        secret: user.twoFactorSecret,
        token: code
    });

    if (!result.valid) {
        return next(new AppError("Invalid authentication code!", 400));
    };

    user.twoFactorEnabled = true;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "2FA enabled successfully",
    })
});

// Controller to login user (2FA)
// POST /api/v1/auth/2fa/verify-login
const verify2FALogin = catchAsync(async (req, res, next) => {
    const { code } = req.body;
    const { twoFA } = req.cookies;

    if (!twoFA) {
        return next(new AppError("Token is required!", 400));
    };

    const payload = await jwt.verify(twoFA, process.env.JWT_SECRET);

    if (!payload) {
        return next(new AppError("JWT invalid or expires!", 400));
    };

    if (payload.scope !== "2fa") {
        return next(new AppError("Invalid token!", 400));
    };

    const user = await User.findById(payload.id).select("+twoFactorSecret");

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    if (!user.twoFactorEnabled) {
        return next(new AppError("2FA is not enabled!", 400));
    };

    if (user.isDeleted) {
        return next(new AppError("This account is deleted!", 401));
    };

    const result = await otplib.verify({
        secret: user.twoFactorSecret,
        token: code,
    });

    if (!result.valid) {
        return next(new AppError("Invalid authentication code", 401));
    };

    res.clearCookie("twoFA", {
        secure: process.env.NODE_MODE === "prod",
        httpOnly: true,
        sameSite: process.env.NODE_MODE === "dev" ? "lax" : "lax"
    });

    createSendToken(res, user);
});

// Controller to disable 2FA
// POST /api/v1/auth/2fa/disable
const disable2FA = catchAsync(async (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        return next(new AppError("Password is required!", 400));
    };

    const user = await User.findById(req.user._id).select("+password +twoFactorSecret");

    if (!user) {
        return next(new AppError("User not found!", 404));
    };

    if (!user.twoFactorEnabled) {
        return next(new AppError("2FA has not activated!", 400));
    };

    const isValid = await user.comparePassword(password);

    if (!isValid) {
        return next(new AppError("Password is incorrect!", 400));
    };

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "2FA successfully disabled!"
    });
});

module.exports = {
    register,
    login,
    logout,
    getMe,
    googleCallback,
    verifyEmail,
    forgotPassword,
    resetPassword,
    setup2FA,
    verify2FASetup,
    verify2FALogin,
    disable2FA
};