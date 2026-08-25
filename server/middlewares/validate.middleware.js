const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map(err => {
                return {
                    field: err.path.join("."),
                    message: err.message
                };
            });

            return res.status(400).json({
                status: "fail",
                message: "Validation failed!",
                errors
            });
        };

        req.body = result.data;

        next();
    };
};

module.exports = validate;