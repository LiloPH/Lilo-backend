"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const http_status_codes_1 = require("http-status-codes");
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Something went wrong';
    if (err instanceof errors_1.BadRequest) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof errors_1.NotFoundError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof errors_1.ConflictError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof errors_1.UnauthenticatedError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    if (err.name === "ValidationError") {
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(",");
        statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    }
    // Handle duplicate key error (Mongoose MongoDB error)
    if (err.code && err.code === 11000) {
        message = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
        statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    }
    // Handle CastError (invalid ObjectId in MongoDB)
    if (err.name === "CastError") {
        message = `No item found with id: ${err.value}`;
        statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
    }
    res.status(statusCode).json({ error: { message: message, code: statusCode } });
};
exports.default = errorHandler;
