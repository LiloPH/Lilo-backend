import mongoose from "mongoose";
import crypto from "crypto";

type Role = "user" | "admin" | "merchant";

interface AccountType {
  name: string;
  email: string;
  googleId?: string;
  picture?: string;
  role: Role;
  key: string;
  generateToken: () => Promise<string>;
}

const accountSchema = new mongoose.Schema<AccountType>(
  {
    name: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/dtmqzxchr/image/upload/v1739724089/default-profile_slswii.png",
    },
    role: {
      type: String,
      enum: ["user", "admin", "merchant"],
      default: "user",
    },
    key: {
      type: String,
    },
  },
  { timestamps: true }
);

accountSchema.methods.generateToken = async function () {
  const api_key = await crypto.randomBytes(32).toString("hex");
  this.key = api_key;
  await this.save();
  return api_key;
};

export default mongoose.model<AccountType>("Account", accountSchema);
