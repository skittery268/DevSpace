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
const projectRouter = require("./routers/project.router");
const nodeRouter = require("./routers/node.router");

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
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/nodes", nodeRouter);

// Global error handler
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