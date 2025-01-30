import { Response, Request } from "express";
import { BadRequest } from "../errors";
import { Account, Token } from "../models";
import { validateServerAuth } from "../utils";
import { StatusCodes } from "http-status-codes";

const login = async (req: Request, res: Response): Promise<any> => {
  const { serverauth } = req.body;

  if (serverauth) {
    const payload = await validateServerAuth(serverauth);
    if (!payload) {
      throw new BadRequest("Invalid Credentials");
    }

    const account = await Account.findOne({ email: payload.email });

    if (!account) {
      const newAccount = await Account.create({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      });

      const key = await newAccount.generateToken();

      return res.status(201).json({
        status: "success",
        user: {
          name: newAccount.name,
          email: newAccount.email,
          picture: newAccount.picture,
        },
        key,
      });
    }

    const key = await account.generateToken();
    return res.json({
      status: "success",
      user: {
        name: account.name,
        email: account.email,
        picture: account.picture,
      },
      key,
    });
  }
};

const logout = async (req: Request, res: Response) => {
  const authKey = req.headers["x-api-key"];

  if (!authKey) {
    throw new BadRequest("Invalid Access");
  }

  const account = await Account.findOne({ key: authKey });
  if (!account) {
    throw new BadRequest("Invalid Access");
  }

  await Token.create({ token: authKey, tokenType: "key", userId: account._id });

  res.status(StatusCodes.OK).json({ status: "success" });
};

export { login, logout };
