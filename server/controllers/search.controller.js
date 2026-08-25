// Models
const User = require("../models/user.model");
const Product = require("../models/product.model");
const Category = require("../models/category.model");

// Utils
const catchAsync = require("../utils/catchAsync.util");

// -------------------------------------IMPORTS-------------------------------------

// Controller to search users by fullname
// GET /api/v1/search/users
const searchUsers = catchAsync(async (req, res, next) => {
    const { fullname } = req.query;

    const users = await User.find({
        fullname: { $regex: fullname || "", $options: "i" },
        isDeleted: { $ne: true }
    }).lean();

    res.status(200).json({
        status: "success",
        message: "Users returned successfully!",
        results: users.length,
        data: {
            users
        }
    })
});

// Controller to search products by title or description
// GET /api/v1/search/products
const searchProducts = catchAsync(async (req, res, next) => {
    const { title } = req.query;

    const products = await Product.find({ $or: [
        { "universal.title": { $regex: title || "", $options: "i" } },
        { "universal.description": { $regex: title || "", $options: "i" } }
    ] })
        .populate(["universal.category", "universal.sellerId"])
        .lean();

    res.status(200).json({
        status: "success",
        message: "Products returned successfully!",
        results: products.length,
        data: {
            products
        }
    });
});

// Controller to search categories by name or description
// GET /api/v1/search/categories
const searchCategories = catchAsync(async (req, res, next) => {
    const { name } = req.query;

    const categories = await Category.find({ $or: [ 
        { name: { $regex: name, $options: "i" } },
        { description: { $regex: name, $options: "i" } }
    ] }).populate("parentCategory").lean();

    res.status(200).json({
        status: "success",
        message: "Categories returned successfully!",
        results: categories.length,
        data: {
            categories
        }
    });
});

module.exports = { searchUsers, searchProducts, searchCategories };