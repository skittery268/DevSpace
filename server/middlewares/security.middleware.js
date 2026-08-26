const mongoSanitize = require("express-mongo-sanitize");

const expressMongoSanitize = (req, res, next) => {
    const options = { replaceWith: "_" };
    
    if (req.body) mongoSanitize.sanitize(req.body, options);

    if (req.params) mongoSanitize.sanitize(req.params, options);
    
    if (req.query) {
        const sanitized = { ...req.query };

        mongoSanitize.sanitize(sanitized, options);

        Object.defineProperty(req, "query", {
            value: sanitized,
            writable: true,
            configurable: true
        });
    };

    next();
};

module.exports = expressMongoSanitize;