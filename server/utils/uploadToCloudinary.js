// Modules
const streamifier = require("streamifier");

// Configs
const cloudinary = require("../configs/cloudinary.config")

// -------------------------------------IMPORTS-------------------------------------

// Function to upload images in cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            };
        });

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports = uploadToCloudinary;