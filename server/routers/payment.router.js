// Modules
const express = require('express');

// Controllers
const { createCheckoutSession, stripeWebhook } = require('../controllers/payment.controller');

// Middlewares
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const checkBan = require('../middlewares/checkBan.middleware');

// Validators
const { createCheckoutSessionSchema } = require('../validators/payment.validator');

// -------------------------------------IMPORTS-------------------------------------

const paymentRouter = express.Router();

// The /webhook route is intentionally excluded; it comes from Stripe, not users.
paymentRouter.post('/checkout', protect, checkBan, validate(createCheckoutSessionSchema), createCheckoutSession);

// Route to handle webhook
paymentRouter.post('/webhook', stripeWebhook);

module.exports = paymentRouter;