import { StatusCodes } from "http-status-codes";
import CustomError from "./CustomError";

class UnauthenticatedError extends CustomError {

    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.UNAUTHORIZED;
    }
}

export default UnauthenticatedError;

