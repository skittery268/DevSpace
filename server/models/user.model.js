// Modules
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/email.util");
const crypto = require("crypto");

// -------------------------------------IMPORTS-------------------------------------


// Schema for user model
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "User full name is required!"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "User email is required!"],
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [function () { return this.provider === "local" }, "User password is required!"],
        minlength: [8, "User password must be at least 8 characters!"],
        select: false
    },
    role: {
        type: String,
        enum: ["user", "admin", "moderator", "seller"],
        default: "user"
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    passwordResetCode: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    },
    resetPasswordAttempts: {
        type: Number,
        select: false,
        default: 0
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
        select: false,
    }
}, { timestamps: true });

// We hashing password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password from DB and password from client
userSchema.methods.comparePassword = async function (candidate) {
    return await bcrypt.compare(candidate, this.password);
};

// Method to send verification token in user email
userSchema.methods.sendVerificationToken = async function () {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES });

    const link = `${process.env.SERVER_URL}/api/v1/auth/verify-email?token=${token}`;

    const html = `
        <h1>Verification Token</h1>
        <a href="${link}">Click here to verifiy your email!</a>
    `

    await sendMail(this.email, "Verification Email", html);
};

// Method to send reset password code in user email
userSchema.methods.sendResetPasswordCode = async function () {
    const resetCode = crypto.randomInt(100000, 1000000)

    const hashedCode = crypto
        .createHash("sha256")
        .update(resetCode.toString())
        .digest("hex");

    this.resetPasswordAttempts = 0;
    this.resetPasswordExpires = Date.now() + process.env.RESET_PASSWORD_EXPIRES * 60 * 1000;
    this.passwordResetCode = hashedCode;

    await this.save();

    const html = `
        <h1>Reset Your Password</h1>
        <p>Code for reset password: ${resetCode.toString()}</p>
    `;

    await sendMail(this.email, "Reset Password", html);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
