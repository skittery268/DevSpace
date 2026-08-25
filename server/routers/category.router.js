// Modules
const express = require("express");

// Controllers
const { getCategories, createCategory, editCategory, deleteCategory } = require("../controllers/category.controller");

// Middlewares
const { protect, allowedTo } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const parseFields = require("../middlewares/parseFields.middleware");
const validate = require("../middlewares/validate.middleware");
const checkBan = require("../middlewares/checkBan.middleware");

// Validators
const { createCategorySchema, editCategorySchema } = require("../validators/category.validator");

// -------------------------------------IMPORTS-------------------------------------

const categoryRouter = express.Router();

// Route to get categories by query (page, limit)
categoryRouter.get("/", getCategories);

categoryRouter.use(protect, checkBan, allowedTo("admin", "moderator"));

// Route to create new category
categoryRouter.post(
    "/createcategory", 
    upload.single("image"),
    parseFields,
    validate(createCategorySchema),
    createCategory
);
// Route to edit category information by id
categoryRouter.patch(
    "/editcategory/:id",
    upload.single("image"),
    parseFields,
    validate(editCategorySchema),
    editCategory
);
// Route to delete category by id
categoryRouter.delete(
    "/deletecategory/:id",
    deleteCategory
);

module.exports = categoryRouter;