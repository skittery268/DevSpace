// Modules
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Schema for bans of users
const adminActionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["warn", "ban", "unban", "unwarn"],
        default: "warn"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required!"]
    },
    administrator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Admin ID is required!"]
    },
    reason: {
        type: String,
        required: [true, "Action reason is required!"],
        trim: true
    },
    expiresAt: {
        type: Date,
        default: null
    },
    targetAction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminAction",
        default: null,
    }
}, { timestamps: true });

const AdminAction = mongoose.model("AdminAction", adminActionSchema);

module.exports = AdminAction;
