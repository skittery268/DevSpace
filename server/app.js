// Inject variables from .env file to process.env object
require("dotenv").config();

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

// Routers
const authRouter = require("./routers/auth.router");

// -------------------------------------IMPORTS-------------------------------------

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(passport.initialize());

// Security middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(helmet());
app.use(hpp());

// Routers
app.use("/api/v1/auth", authRouter);

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