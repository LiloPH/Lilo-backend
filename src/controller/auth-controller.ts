import { Response, Request } from "express";
import { BadRequest } from "../errors";
import { Account, Token } from "../models";
import { validateServerAuth } from "../utils";
import { StatusCodes } from "http-status-codes";

const loginAdmin = async (req: Request, res: Response): Promise<any> => {
  const { code } = req.body;

  const { payload, status, refresh_token, id_token, error } =
    await validateServerAuth(code);

  if (!status) throw new BadRequest(error);

  const account = await Account.findOne({ googleId: payload.sub });

  if (!account) {
    const newAccount = await Account.create({
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    });

    const key = await newAccount.generateToken();

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      user: {
        id: newAccount._id,
        name: newAccount.name,
        email: newAccount.email,
        picture: newAccount.picture,
      },
      key,
      id_token,
    });
  }
  const key = await account.generateToken();

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    user: {
      id: account._id,
      name: account.name,
      email: account.email,
      picture: account.picture,
    },
    key,
    id_token,
  });
};

const adminLogout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  const authHeaders = req.headers["authorization"];
  const key = req.headers["x-api-key"];

  if (
    !refreshToken ||
    !authHeaders ||
    !authHeaders.startsWith("Bearer ") ||
    !key
  ) {
    throw new BadRequest("Invalid Access");
  }

  const idToken = authHeaders.split(" ")[1];

  await Token.create({ tokenType: "refresh", token: refreshToken });
  await Token.create({ tokenType: "id_token", token: idToken });
  await Token.create({ tokenType: "key", token: key });

  res.clearCookie("refresh_token");

  res.status(StatusCodes.OK).json({ status: "success" });
};

export { loginAdmin, adminLogout };
