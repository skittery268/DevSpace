// Inject variables from .env file to process.env object
require("dotenv").config();

// Sentry init
const Sentry = require("./configs/sentry.config");

// Modules
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");

// Security modules
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");

// Configs
const connectDB = require("./configs/mongo.config");
require("./configs/passport.config");

// Global error controller
const globalErrorHandler = require("./controllers/error.controller");

// Middlewares
const expressMongoSanitize = require("./middlewares/security.middleware");

// Utils
const AppError = require("./utils/appError.util");

// Routers
const authRouter = require("./routers/auth.router");
const categoryRouter = require("./routers/category.router");
const orderRouter = require("./routers/order.router");
const paymentRouter = require("./routers/payment.router");
const productRouter = require("./routers/product.router");
const reviewRouter = require("./routers/review.router");
const userRouter = require("./routers/user.router");
const searchRouter = require("./routers/search.router");

// -------------------------------------IMPORTS-------------------------------------

const app = express();

app.use('/api/v1/payment/webhook', express.raw({ type: "application/json" }));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Security middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(helmet());
app.use(hpp());
app.use(expressMongoSanitize);

// Test route to check running server or not
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server running successfully!"
    });
});

// Routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/users", userRouter);

app.all('/*splat', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Sentry error handler (must be registered after all routers and before other error handlers)
Sentry.setupExpressErrorHandler(app);

// Global error handler
app.use(globalErrorHandler);

// Function to run server
const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}!`);
        });

        server.on("error", (err) => {
            console.log("Failed to start server: ", err);

            process.exit(1);
        })
    } catch (err) {
        console.log("Failed to start server: ", err);

        process.exit(1);
    };
};

startServer();