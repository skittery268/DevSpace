// Modules
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Schema for category model
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required!"],
        unique: true
    },
    description: {
        type: String,
        required: [true, "Category description is required!"]
    },
    image: {
        url: String,
        public_id: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "Category"
    },
    allowedAttributes: {
        type: [String]
    }
}, { timestamps: true });

// Indexing
categorySchema.index({ parentCategory: 1, isActive: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;