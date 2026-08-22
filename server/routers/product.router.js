// Modules
const express = require('express');

// Controllers
const { getProducts, getProduct, getProductsByCategory, createProduct, editProduct, deleteProduct } = require('../controllers/product.controller');

// Middlewares
const { protect, allowedTo } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const parseFields = require('../middlewares/parseFields.middleware');

// ----------------------------------------IMPORTS---------------------------------------

const productRouter = express.Router();

// Route to get products by query (page, limit)
productRouter.get("/", getProducts);

// Route to get products of a specific category
productRouter.get("/category/:categoryId", getProductsByCategory);

// Route to get a single product by id
productRouter.get("/:productId", getProduct);

// Middlewares
productRouter.use(protect, allowedTo("seller", "admin"));

// Route to create new product
productRouter.post(
    "/createproduct/:categoryId",
    upload.array("images", 5),
    parseFields,
    createProduct
);
// Route to edit product information by id
productRouter.patch(
    "/editproduct/:productId",
    upload.array("images", 5),
    parseFields,
    editProduct
);
// Route to delete product by id
productRouter.delete(
    "/deleteproduct/:productId",
    deleteProduct
);

module.exports = productRouter;