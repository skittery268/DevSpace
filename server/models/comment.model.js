// Modules
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Schema for comment model
const commentSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author ID is required!"]
    },
    content: {
        type: String,
        required: [true, "Comment content is required!"]
    }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;