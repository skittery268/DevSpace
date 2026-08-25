// Modules
const express = require("express");

// Controllers
const { getUserOrders, deleteOrder, changeStatus } = require("../controllers/order.controller");

// Middlewares
const { protect, allowedTo } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const checkBan = require("../middlewares/checkBan.middleware");

// Validators
const { changeStatusSchema } = require("../validators/order.validator");

// -------------------------------------IMPORTS-------------------------------------

const orderRouter = express.Router();

// Middlewares
orderRouter.use(protect, checkBan);

// Route to get all user orders
orderRouter.get("/", getUserOrders);

// Route to delete order by id
orderRouter.delete("/:orderId", deleteOrder);

// Route to edit order by id
orderRouter.patch("/:orderId", allowedTo("admin"), validate(changeStatusSchema), changeStatus);

module.exports = orderRouter;