import { Response, Request } from "express";
import { BadRequest } from "../errors";
import { Account } from "../models";
import { confirmationEmail, validateServerAuth } from "../utils";
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
        googleId: payload.sub,
        verified: { email_verified: true },
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

  const isExist = await Account.findOne({ email });

  if (isExist) {
    throw new BadRequest("Account already exist");
  }

  const account = await Account.create({ email, name, username, password });
  const otp = await account.generateEmailOtp();

  if (!account.email) {
    throw new BadRequest("Email is required");
  }

  const { status } = await confirmationEmail(account.email, otp);

  if (status === "error") {
    await Account.findByIdAndDelete(account._id);
    throw new BadRequest("Email could not be sent");
  }

  res
    .status(StatusCodes.CREATED)
    .json({ message: "Email send for verification" });
};

const sendEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  const account = await Account.findOne({ email });

  if (!account) {
    throw new BadRequest("Account not found");
  }

  if (account.verified.email_verified) {
    throw new BadRequest("Email already verified");
  }

  if (!account.email) {
    throw new BadRequest("Email is required");
  }

  const otp = await account.generateEmailOtp();
  const { status } = await confirmationEmail(account.email, otp);
  if (status === "error") {
    throw new BadRequest("Email could not be sent");
  }

  res.status(StatusCodes.OK).json({ message: "New OTP sent to your email" });
};

const verifyEmailConfirmation = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const account = await Account.findOne({ email });

  if (!account) {
    throw new BadRequest("Account not found");
  }

  if (account.verified.email_verified) {
    throw new BadRequest("Email already verified");
  }

  const isMatch = await account.verifyEmailOtp(otp);

  if (!isMatch) {
    throw new BadRequest("Invalid OTP");
  }

  res.status(StatusCodes.OK).json({ message: "Email verified" });
};

const logout = async (req: Request, res: Response) => {};

export { login, register, logout, sendEmail, verifyEmailConfirmation };
