import { Response, Request } from "express";
import { BadRequest, UnauthenticatedError } from "../errors";
import { Account, Token } from "../models";
import {
  validateServerAuth,
  validateRefreshToken,
  validateIdToken,
} from "../utils";
import { StatusCodes } from "http-status-codes";

const loginAdmin = async (req: Request, res: Response): Promise<any> => {
  const { code } = req.body;

  const { payload, status, refresh_token, id_token, message } =
    await validateServerAuth(code);

  if (!status) throw new BadRequest(message);

  const account = await Account.findOne({ googleId: payload.sub });

  if (!account || account.role !== "admin") {
    throw new UnauthenticatedError("Unathorized access");
  }

  if (!account) {
    const newAccount = await Account.create({
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    });

    await newAccount.generateToken();

    throw new UnauthenticatedError("Unathorized access");

    // res.cookie("refresh_token", refresh_token, {
    //   httpOnly: true,
    //   sameSite: "strict",
    //   secure: process.env.NODE_ENV === "production",
    //   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    // return res.status(StatusCodes.CREATED).json({
    //   user: {
    //     id: newAccount._id,
    //     name: newAccount.name,
    //     email: newAccount.email,
    //     picture: newAccount.picture,
    //   },
    //   key,
    //   id_token,
    // });
  }
  const key = await account.generateToken();

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(StatusCodes.OK).json({
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

  console.log(refreshToken, authHeaders, key);

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

const adminRefresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) throw new UnauthenticatedError("Token not exist");

  const refreshTokenExists = await Token.findOne({
    tokenType: "refresh",
    token: refreshToken,
  });

  if (refreshTokenExists) throw new UnauthenticatedError("token revoked");

  const { status, id_token } = await validateRefreshToken(refreshToken);

  if (!status) throw new UnauthenticatedError("Failed");
  if (!id_token) throw new UnauthenticatedError("Failed");

  const { status: status2, payload } = await validateIdToken(id_token);

  if (!status2) throw new UnauthenticatedError("Failed");

  const account = await Account.findOne({ googleId: payload?.sub });

  if (!account) throw new UnauthenticatedError("Failed");

  res.status(StatusCodes.OK).json({
    id_token,
    key: account.key,
    user: {
      id: account._id,
      name: account.name,
      email: account.email,
      picture: account.picture,
    },
  });
};

const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { code } = req.body;

  const { payload, status, message } = await validateServerAuth(code);

  if (!status) throw new BadRequest(message);

  const account = await Account.findOne({ googleId: payload.sub });

  if (!account) {
    const newAccount = await Account.create({
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    });

    const key = await newAccount.generateToken();

    return res.status(StatusCodes.CREATED).json({
      user: {
        id: newAccount._id,
        name: newAccount.name,
        email: newAccount.email,
        picture: newAccount.picture,
      },
      key,
    });
  }

  const key = await account?.generateToken();

  res.status(StatusCodes.OK).json({
    user: {
      id: account?._id,
      name: account?.name,
      email: account?.email,
      picture: account?.picture,
    },
    key,
  });
};

const logoutUser = async (req: Request, res: Response) => {
  const key = req.headers["x-api-key"];

  if (!key) {
    throw new BadRequest("Invalid Access");
  }

  const account = await Account.findOne({ apiKey: key });

  if (!account) throw new BadRequest("Invalid Access");

  await Token.create({ tokenType: "key", token: key });

  res.status(StatusCodes.OK).json({ status: "success" });
};

export { loginAdmin, adminLogout, adminRefresh, loginUser, logoutUser };
