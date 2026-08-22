// Modules
const multer = require("multer");

// ---------------------------------------IMPORTS---------------------------------------

// Memory storage
const storage = multer.memoryStorage();

// Function to process images
const upload = multer({ storage });

module.exports = upload;