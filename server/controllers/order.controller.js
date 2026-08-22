// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// Models
const Order = require("../models/order.model");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get user orders
const getUserOrders = catchAsync(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    const orders = await Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    
    const orderCount = await Order.countDocuments({ userId: req.user._id });

    res.status(200).json({
        status: "success",
        message: "Orders returned successfully!",
        orderCount,
        data: {
            orders
        }
    })
});

// Controller to delete user order
const deleteOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError("Order not found!", 404));
    };

    if (order.userId.toString() != req.user._id.toString()) {
        return next(new AppError("You cant delete this order!", 401));
    };

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
        status: "success",
        message: "Order deleted successfully!"
    });
});

// Controller to change order status
const changeStatus = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError("Order not found!", 404));
    };

    order.status = status;

    await order.save();

    res.status(200).json({
        status: "success",
        message: "Order status changed successfully!",
        data: {
            order
        }
    });
});

module.exports = { getUserOrders, deleteOrder, changeStatus };