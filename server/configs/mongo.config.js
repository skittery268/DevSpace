// Modules
const mongoose = require("mongoose");

// -------------------------------------IMPORTS-------------------------------------

// Function to connect server with Data base (MongoDB)
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected!");
    } catch (err) {
        throw new Error(err);
    };
};

module.exports = connectDB;