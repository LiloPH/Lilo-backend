import { StatusCodes } from "http-status-codes";
import CustomError from './CustomError'

class ConflictError extends CustomError {
    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.CONFLICT;
    }
}

export default ConflictError

