import { Request, Response } from "express";
import { Account } from "../models";

const analytics = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Admin analytics" });
};

export { analytics };
