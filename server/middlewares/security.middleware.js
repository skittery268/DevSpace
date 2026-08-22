const mongoSanitize = require("express-mongo-sanitize");

const expressMongoSanitize = (req, res, next) => {
    const options = { replaceWith: "_" };
    
    if (req.body) mongoSanitize.sanitize(req.body, options);

    if (req.params) mongoSanitize.sanitize(req.params, options);
    
    if (req.query) mongoSanitize.sanitize(req.query, options);

    next();
};

module.exports = expressMongoSanitize;