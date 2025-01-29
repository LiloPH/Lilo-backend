import { UnauthenticatedError } from "../errors";
import { Account } from "../models";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type Role = "user" | "admin" | "merchant";

interface ExtendedRequest extends Request {
  user?: {
    userId: string;
    name: string;
    email: string;
    role: Role;
  };
}

interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

const authKey = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const authKey = req.headers["authorization"];

  if (!authKey || authKey.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Invalid Access");
  }

  const key = authKey.split(" ")[1];

  const account = await Account.findOne({ key: key });

  if (!account) {
    throw new UnauthenticatedError("Invalid Access");
  }

  req.user = {
    userId: account._id.toString(),
    name: account.name,
    email: account.email || "",
    role: account.role,
  };

  next();
};

const authToken = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.headers["authorization"];

  if (!authToken || authToken.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Invalid Access");
  }

  const token = authToken.split(" ")[1];

  const secret = process.env.JWT_SECRET_ACCESS;
  if (!secret) {
    throw new Error("JWT_SECRET_ACCESS environment variable is not defined");
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthenticatedError("Token is expired");
    }
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

const authPermission = (...roles: Role[]) => {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      throw new UnauthenticatedError("Unathorized access to this route");
    }
    next();
  };
};

export { authKey, authToken, authPermission };
