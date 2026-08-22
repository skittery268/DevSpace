// Models
const Category = require("../models/category.model");
const AppError = require("../utils/appError.util");

// Utils
const catchAsync = require("../utils/catchAsync.util");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// Configs
const cloudinary = require("../configs/cloudinary.config");

// -------------------------------------IMPORTS-------------------------------------

// Contoller to get categories
const getCategories = catchAsync(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;

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
const deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        return next(new AppError("Category not found!", 404));
    };

    if (category.image.url) {
        await cloudinary.uploader.destroy(category.image.public_id);
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
        status: "success",
        message: "Category deleted successfully!"
    });
});

// Controller to edit category information
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