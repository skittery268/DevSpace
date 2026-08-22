// Middleware function to parse JSON-encoded fields sent through multipart/form-data.
// FormData serialises everything to strings, so arrays/objects arrive as JSON text.
const parseFields = (req, res, next) => {
    if (typeof req.body.allowedAttributes === "string") {
        req.body.allowedAttributes = JSON.parse(req.body.allowedAttributes);
    }

    if (typeof req.body.attributes === "string") {
        req.body.attributes = JSON.parse(req.body.attributes);
    }

    next();
};

module.exports = parseFields;