// Models
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Schema for node model
const nodeSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project ID is required!"]
    },
    name: {
        type: String,
        required: [true, "Node name is required!"],
        trim: true
    },
    type: {
        type: String,
        enum: ["file", "folder"],
        required: [true, "Node type is required!"]
    },
    // path: {
    //     type: String,
    //     required: [true, "Node path is required!"],
    //     trim: true
    // },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node"
    },
    content: {
        type: String,
        default: undefined
    }
}, { timestamps: true });

const Node = mongoose.model("Node", nodeSchema);

module.exports = Node;