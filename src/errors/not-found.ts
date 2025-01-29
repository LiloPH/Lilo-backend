import { StatusCodes } from "http-status-codes";
import CustomError from './CustomError'

class NotFoundError extends CustomError {
    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.NOT_FOUND;
    }
}

export default NotFoundError

