// Modules
const express = require("express");

// Controllers
const { getUserOrders, deleteOrder, changeStatus } = require("../controllers/order.controller");

// Middlewares
const { protect, allowedTo } = require("../middlewares/auth.middleware");

// ---------------------------------------IMPORTS---------------------------------------

const orderRouter = express.Router();

// Middlewares
orderRouter.use(protect);

// Route to get all user orders
orderRouter.get("/", getUserOrders);

// Route to delete order by id
orderRouter.delete("/:orderId", deleteOrder);

// Route to edit order by id
orderRouter.patch("/:orderId", allowedTo("admin"), changeStatus);

module.exports = orderRouter;