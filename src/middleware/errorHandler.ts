import { Request, Response, NextFunction } from 'express';
import { BadRequest, NotFoundError, ConflictError, UnauthenticatedError } from '../errors';
import { StatusCodes } from 'http-status-codes';


const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = 'Something went wrong';

    if (err instanceof BadRequest) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof NotFoundError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof ConflictError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof UnauthenticatedError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    if (err.name === "ValidationError") {
        message = Object.values(err.errors)
            .map((item: any) => item.message)
            .join(",");
        statusCode = StatusCodes.BAD_REQUEST;
    }

    // Handle duplicate key error (Mongoose MongoDB error)
    if (err.code && err.code === 11000) {
        message = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
        statusCode = StatusCodes.BAD_REQUEST;
    }

    // Handle CastError (invalid ObjectId in MongoDB)
    if (err.name === "CastError") {
        message = `No item found with id: ${err.value}`;
        statusCode = StatusCodes.NOT_FOUND;
    }

    res.status(statusCode).json({ error: {message: message, code: statusCode} });
};

export default errorHandler;
