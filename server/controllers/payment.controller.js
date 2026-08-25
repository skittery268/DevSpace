// Models
const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const Product = require('../models/product.model');

// Modules
const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);

// Utils
const AppError = require('../utils/appError.util');
const catchAsync = require('../utils/catchAsync.util');

// -------------------------------------IMPORTS-------------------------------------

// Controller to create Stripe checkout session
// POST /api/v1/payment/checkout
const createCheckoutSession = catchAsync(async (req, res, next) => {
    const { userOrder, userInfo } = req.body;

    if (!userInfo) {
        return next(new AppError("User information is required!", 400));
    };

    // Quantity per product id, fully validated before anything is sent to Stripe
    const obj = {};

    for (const item of userOrder) {
        if (obj[item.id]) {
            return next(new AppError("Order contains the same product twice!", 400));
        };

        obj[item.id] = item.quantity;
    };

    const productsIds = Object.keys(obj);

    const products = await Product.find({ _id: { $in: productsIds } });

    if (products.length !== productsIds.length) {
        return next(new AppError("Products cant be found", 404));
    }

    const orderDistributions = [];

    for (const product of products) {
        const quantity = obj[product._id.toString()];

        if (product.universal.stock < quantity) {
            return next(new AppError(`Not enough stock for "${product.universal.title}"!`, 400));
        };

        const itemTotal = product.universal.price * quantity;
        const commission = Number((itemTotal * 0.05).toFixed(2));
        const sellerAmount = Number((itemTotal - commission).toFixed(2));

        orderDistributions.push({
            productId: product._id,
            sellerId: product.universal.sellerId,
            quantity,
            itemTotal,
            commission,
            sellerAmount
        });
    }

    const totalAmount = orderDistributions.reduce((accumulator, item) => accumulator + item.itemTotal, 0);
    const platformCommission = orderDistributions.reduce((accumulator, item) => accumulator + item.commission, 0);
    const sellerNetAmount = Number((totalAmount - platformCommission).toFixed(2));
    const transferGroup = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const line_items = products.map(product => {
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: product.universal.title,
                    description: product.universal.description
                },

                // Stripe expects an integer amount in cents
                unit_amount: Math.round(product.universal.price * 100),
            },
            quantity: obj[product._id.toString()]
        }
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        payment_intent_data: {
            transfer_group: transferGroup
        },
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL
    });

    // stripePaymentIntentId is intentionally not set here: the session has no payment
    // intent yet, and the unique index would reject a second document with a null value.
    const payment = await Payment.create({
        userId: req.user._id,
        stripeSessionId: session.id,
        transferGroup,
        totalAmount,
        platformCommission,
        sellerNetAmount,
        sellerDistributions: orderDistributions,
        status: "pending",
        userInfo
    });

    res.status(201).json({
        status: "success",
        message: "Session created!",
        data: {
            payment,
            sessionUrl: session.url,
            sessionId: session.id
        }
    });
});

// Controller to handle Stripe webhook events
// POST /api/v1/payment/webhook
const stripeWebhook = catchAsync(async (req, res, next) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return next(new AppError(`Webhook error: ${err.message}`, 400));
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        if (session.payment_status !== "paid") return res.status(200).json({ received: true });

        // Stripe delivers webhooks at least once, so the payment is claimed atomically:
        // only the first delivery flips it to "succeeded" and creates the order.
        const payment = await Payment.findOneAndUpdate(
            { stripeSessionId: session.id, status: { $ne: "succeeded" } },
            {
                $set: {
                    status: "succeeded",
                    stripePaymentIntentId: session.payment_intent,
                    webhookProcessed: true
                }
            },
            { new: true }
        );

        if (!payment) {
            return res.status(200).json({ received: true });
        }

        const userInfo = payment.userInfo;

        const products = [];

        for (const distribution of payment.sellerDistributions) {
            products.push({
                productId: distribution.productId,
                sellerId: distribution.sellerId,
                quantity: distribution.quantity,
                itemTotal: distribution.itemTotal
            });
        };

        try {
            await Order.create({
                userId: payment.userId,
                userInfo,
                products,
                totalAmount: payment.totalAmount,
                paymentId: payment._id
            });

            for (const distribution of payment.sellerDistributions) {
                await Product.updateOne(
                    { _id: distribution.productId },
                    { $inc: { "universal.stock": -distribution.quantity } }
                );
            };
        } catch (err) {
            // Release the claim so a Stripe retry can process this session again
            payment.status = "pending";
            payment.webhookProcessed = false;

            await payment.save();

            return next(new AppError(`Failed to complete order: ${err.message}`, 500));
        };

        return res.status(200).json({ received: true });
    };

    if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;

        // The payment intent carries the transfer group set when the session was created,
        // which is the only link back to our own payment document.
        const payment = paymentIntent.transfer_group
            ? await Payment.findOne({ transferGroup: paymentIntent.transfer_group })
            : null;

        if (!payment) {
            return res.status(200).json({ received: true });
        }

        if (payment.status === "succeeded") {
            return res.status(200).json({ received: true });
        }

        payment.status = "failed";
        payment.stripePaymentIntentId = paymentIntent.id;
        payment.webhookProcessed = true;

        await payment.save();
    };

    if (event.type === "checkout.session.expired") {
        const session = event.data.object;

        await Payment.findOneAndUpdate({
            stripeSessionId: session.id,
            status: "pending"
        }, {
            $set: {
                status: "canceled",
                webhookProcessed: true
            }
        });
    };

    res.status(200).json({ received: true });
});

module.exports = { createCheckoutSession, stripeWebhook };