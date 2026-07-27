// Modules
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
        unique: true
    },
    password: {
        type: String,
        required: [function () { return this.provider === "local" }, "User password is required!"],
        select: false
    },
    role: {
        type: String,
        enum: ["user", "admin", "owner"],
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
    }
}, { timestamps: true });

// We hashing password before saving
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password from DB and password from client
userSchema.methods.comparePassword = async function (candidate) {
    return await bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
