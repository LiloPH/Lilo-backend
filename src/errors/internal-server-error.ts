import { StatusCodes } from "http-status-codes";
import CustomError from "./CustomError";

class EternalServerError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export default EternalServerError;
