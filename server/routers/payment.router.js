// Modules
const express = require('express');

// Controllers
const { createCheckoutSession, stripeWebhook } = require('../controllers/payment.controller');

// Middlewares
const { protect } = require('../middlewares/auth.middleware');

// -------------------------------------IMPORTS-------------------------------------

const paymentRouter = express.Router();

// The /webhook route is intentionally excluded; it comes from Stripe, not users.
paymentRouter.post('/checkout', protect, createCheckoutSession);

// Route to handle webhook
paymentRouter.post('/webhook', stripeWebhook);

module.exports = paymentRouter;