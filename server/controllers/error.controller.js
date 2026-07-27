// Function to send developer errors (full errors)
const sendErrorDev = (err, res) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    res.status(statusCode).json({
        status,
        message: err.message,
        stack: err.stack,
        err
    });
};

// Function to send production errors
const sendErrorProd = (err, res) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    if (err.isOperational) {
        return res.status(statusCode).json({
            status,
            message: err.message
        });
    };

    console.log(err);

    res.status(500).json({
        status: "error",
        message: "Something went wrong!"
    });
};

// Controller to handle app errors
const globalErrorHandler = (err, req, res, next) => {
    if (process.env.NODE_MODE === "dev") {
        sendErrorDev(err, res);
    } else {
        sendErrorProd(err, res);
    };
};

module.exports = globalErrorHandler;