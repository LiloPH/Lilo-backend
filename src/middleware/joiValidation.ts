import { Request, Response, NextFunction } from "express";
import { BadRequest } from "../errors";
import Joi from "joi";

interface JoiValidationType {
  (joiSchema: Joi.Schema): (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
}

const joiValidaiton: JoiValidationType = (schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((err) => err.message.replace(/"/g, ""))
        .join(",");
      throw new BadRequest(errorMessage);
    }

    next();
  };
};

export default joiValidaiton;
