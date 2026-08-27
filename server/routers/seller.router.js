// Modules
const express = require("express");

// Controllers
const { getSellerProducts, getSellerOrders } = require("../controllers/seller.controller");

// Middlewares
const { protect, allowedTo } = require("../middlewares/auth.middleware");
const checkBan = require("../middlewares/checkBan.middleware");

// -------------------------------------IMPORTS-------------------------------------

const sellerRouter = express.Router();

sellerRouter.use(protect, checkBan, allowedTo("seller", "admin", "moderator"));

// Route to get all seller products
sellerRouter.get("/products", getSellerProducts);
// Route to get all seller orders
sellerRouter.get("/orders", getSellerOrders);

module.exports = sellerRouter;