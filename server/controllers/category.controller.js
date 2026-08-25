// Models
const Category = require("../models/category.model");

// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// Configs
const cloudinary = require("../configs/cloudinary.config");
const Product = require("../models/product.model");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get categories
// GET /api/v1/category
const getCategories = catchAsync(async (req, res, next) => {
    const page = Math.max(1, Number(req.query.page)) || 1;
    const limit = Math.min(Number(req.query.limit), 100) || 12;

    const categories = await Category.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("parentCategory")
        .lean();

    const categoryCount = await Category.countDocuments();

    res.status(200).json({
        status: "success",
        message: "Categories returned successfully!",
        categoryCount,
        data: {
            categories
        }
    });
});

// Controller to create new category
// POST /api/v1/category/createcategory
const createCategory = catchAsync(async (req, res, next) => {
    const { name, description, allowedAttributes, parentCategory } = req.body;
    const { file } = req;

    if (!file) {
        return next(new AppError("Category image is required!", 400));
    };
    
    const result = await uploadToCloudinary(file.buffer, "categoryImages");

    const image = {
        url: result.secure_url,
        public_id: result.public_id
    };

    const category = await Category.create({ name, description, allowedAttributes, image, parentCategory });

    await category.populate("parentCategory");

    res.status(201).json({
        status: "success",
        message: "Category created successfully!",
        data: {
            category
        }
    });
});

// Controller to delete category
// DELETE /api/v1/category/deletecategory/:id
const deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        return next(new AppError("Category not found!", 404));
    };

    const hasChildren = await Category.exists({ parentCategory: category._id });
    const hasProducts = await Product.exists({ "universal.category": category._id });

    if (hasChildren || hasProducts) {
        return next(new AppError("You cant delete this category because he has children categories or products!", 409));
    };

    if (category.image.url) {
        await cloudinary.uploader.destroy(category.image.public_id);
    };

    await Category.findByIdAndDelete(id);

    res.status(200).json({
        status: "success",
        message: "Category deleted successfully!"
    });
});

// Controller to edit category information
// PATCH /api/v1/category/editcategory/:id
const editCategory = catchAsync(async (req, res, next) => {
    const { name, description, allowedAttributes, parentCategory } = req.body;
    const { file } = req;
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        return next(new AppError("Category not found!", 404));
    }

    if (file && category.image.url) {
        await cloudinary.uploader.destroy(category.image.public_id);
    }

    if (file) {
        const result = await uploadToCloudinary(file.buffer, "categoryImages");

        const image = {
            url: result.secure_url,
            public_id: result.public_id
        };

        category.image = image;
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (allowedAttributes) category.allowedAttributes = allowedAttributes;
    if (parentCategory) category.parentCategory = parentCategory;

    await category.save();

    await category.populate("parentCategory");

    res.status(200).json({
        status: "success",
        message: "Category information edited successfully!",
        data: {
            category
        }
    });
});

module.exports = { getCategories, createCategory, deleteCategory, editCategory };