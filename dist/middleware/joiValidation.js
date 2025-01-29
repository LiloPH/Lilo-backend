"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const joiValidaiton = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((err) => err.message.replace(/"/g, '')).join(",");
            return next(new errors_1.BadRequest(errorMessage));
        }
        next();
    };
};
exports.default = joiValidaiton;
