import { UnauthenticatedError } from "../errors";
import { Account } from "../models";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { validateIdToken } from "../utils";

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
  const authKey = req.headers["x-api-key"];

  if (!authKey) {
    throw new UnauthenticatedError("Invalid Access");
  }

  const account = await Account.findOne({ key: authKey });

  if (!account) {
    throw new UnauthenticatedError("Invalid Access");
  }

  req.user = {
    userId: account._id.toString(),
    name: account.name,
    email: account.email,
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

  if (!authToken || !authToken.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Invalid token");
  }

  const token = authToken.split(" ")[1];

  try {
    const { status, payload } = await validateIdToken(token);

    if (!status) throw new UnauthenticatedError("status failed");

    const account = await Account.findOne({ googleId: payload?.sub });

    if (!account) throw new UnauthenticatedError("Invalid Access");

    req.user = {
      userId: account._id.toString(),
      name: account.name,
      email: account.email,
      role: account.role,
    };

    next();
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
