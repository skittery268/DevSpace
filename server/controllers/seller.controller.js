// Models
const Order = require("../models/order.model");
const Product = require("../models/product.model");

// Utils
const catchAsync = require("../utils/catchAsync.util");
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get seller products
// GET /api/v1/seller/products
const getSellerProducts = catchAsync(async (req, res, next) => {
    const page = Math.max(1, Number(req.query.page)) || 1;
    const limit = Math.min(Number(req.query.limit), 100) || 12;

    const userProducts = await Product
        .find({ "universal.sellerId": req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const productCount = await Product.countDocuments({ "universal.sellerId": req.user._id });

    res.status(200).json({
        status: "success",
        message: "Products returned successfully!",
        productCount,
        data: {
            products: userProducts
        }
    });
});

// Controller to get seller orders
// GET /api/v1/seller/orders
const getSellerOrders = catchAsync(async (req, res, next) => {
    const sellerId = new mongoose.Types.ObjectId(req.user._id)
    const page = Math.max(1, Number(req.query.page)) || 1;
    const limit = Math.min(Number(req.query.limit), 100) || 12;

    const [result] = await Order.aggregate([
        {
            $match: {
                "products.sellerId": sellerId
            }
        },
        {
            $project: {
                userId: 1,
                userInfo: 1,
                totalAmount: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,

                products: {
                    $filter: {
                        input: "$products",
                        as: "product",
                        cond: {
                            $eq: [
                                "$$product.sellerId",
                                sellerId
                            ]
                        }
                    }
                }
            }
        },
        {
            $facet: {
                orders: [
                    { $sort: { createdAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit }
                ],

                total: [
                    { $count: "count" }
                ]
            }
        }
    ])

    const ordersCount = result.total[0]?.count || 0;

    res.status(200).json({
        status: "success",
        message: "Orders returned successfully!",
        ordersCount,
        data: {
            orders: result.orders
        }
    });
});

module.exports = { getSellerProducts, getSellerOrders };