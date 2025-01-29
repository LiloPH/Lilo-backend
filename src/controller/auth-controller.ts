import { Response, Request } from "express";
import { BadRequest } from "../errors";
import { Account } from "../models";
import { validateServerAuth } from "../utils";
import { StatusCodes } from "http-status-codes";

const login = async (req: Request, res: Response): Promise<any> => {
  const { email, username, password, serverauth } = req.body;

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

      return res.json({
        id: newAccount._id,
        email: newAccount.email,
        username: newAccount.username,
        name: newAccount.name,
        key,
      });
    }

    const key = await account.generateToken();

    return res.status(StatusCodes.CREATED).json({
      id: account._id,
      email: account?.email,
      username: account?.username,
      name: account?.name,
      key,
    });
  }

  let query: any = {};

  if (email) {
    query = { email };
  }

  if (username) {
    query = { username };
  }

  const account = await Account.findOne(query);

  if (!account) {
    throw new BadRequest("Account not found");
  }

  const isMatch = await account.checkPassword(password);

  const key = await account.generateToken();

  if (!isMatch) {
    throw new BadRequest("Invalid Credentials");
  }

  res.status(200).json({});
};

const register = async (req: Request, res: Response) => {
  const { name, email, username, password } = req.body;

  const account = await Account.create({ name, email, username, password });

  const key = await account.generateToken();

  res.status(StatusCodes.CREATED).json({
    id: account._id,
    email: account.email,
    username: account.username,
    name: account.name,
    key,
  });
};

const Logout = async (req: Request, res: Response) => {
  res.json("Logout route");
};

export { login, register, Logout };
