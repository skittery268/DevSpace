// Middleware function to parse JSON-encoded fields sent through multipart/form-data.
// FormData serialises everything to strings, so arrays/objects arrive as JSON text.
const parseFields = (req, res, next) => {
    const { allowedAttributes, attributes, price, stock } = req.body;

    if (typeof allowedAttributes === "string") {
        req.body.allowedAttributes = JSON.parse(allowedAttributes);
    };

    if (typeof attributes === "string") {
        req.body.attributes = JSON.parse(attributes);
    };

    if (typeof price === "string") {
        req.body.price = JSON.parse(price);
    };

    if (typeof stock === "string") {
        req.body.stock = JSON.parse(stock);
    };

    next();
};

module.exports = parseFields;