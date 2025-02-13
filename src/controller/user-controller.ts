import { Request, Response } from "express";
import { Account } from "../models";
import { BadRequest } from "../errors";

const getOneUser = async (req: Request, res: Response) => {
  const key = req.headers["x-api-key"];

  const user = await Account.findOne({ key }).select(
    "name email picture role _id"
  );

  if (!user) throw new BadRequest("User not found");

  res.status(200).json(user);
};

export { getOneUser };
