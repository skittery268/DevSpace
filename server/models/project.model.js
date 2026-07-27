// Modules
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Schema for project model
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Project name is required!"],
        trim: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Owner ID is required!"]
    },
    description: {
        type: String,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Create index for owenerId filed
projectSchema.index({ ownerId: 1 });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;