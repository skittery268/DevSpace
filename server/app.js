// Inject variables from .env file to process.env object
require("dotenv").config();

// Modules
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

// Configs
const connectDB = require("./configs/mongo.config");
require("./configs/passport.config");

// Global error controller
const globalErrorHandler = require("./controllers/error.controller");

// Routers
const authRouter = require("./routers/auth.router");

// -------------------------------------IMPORTS-------------------------------------

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(cookieParser({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(passport.initialize());

app.use("/api/v1/auth", authRouter);

app.use(globalErrorHandler);

// Function to run server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}!`);
        });
    } catch (err) {
        throw new Error(err);
    };
};

startServer();