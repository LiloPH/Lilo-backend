import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

type Role = "user" | "admin" | "merchant";

interface AccountType {
  name: string;
  email?: string;
  username?: string;
  password?: string;
  googleId?: string;
  picture?: string;
  role: Role;
  key: string;
  verified: {
    email_verified: Boolean;
    email_token: String | null;
    email_token_expiration: Date | null;
  };
  password_rest: {
    reset_token: String | null;
    reset_expiration: Date | null;
  };
  checkPassword: (inputPassword: string) => Promise<boolean>;
  generateToken: () => Promise<string>;
}

const accountSchema = new mongoose.Schema<AccountType>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Invalid Email",
      ],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      match: [
        /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{8,}$/,
        "Password must be at least 8 characters, contain at least one uppercase letter, one special symbol, and one number.",
      ],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    picture: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "merchant"],
    },
    key: {
      type: String,
    },
    verified: {
      email_verified: { type: Boolean, default: false },
      email_token: { type: String, default: null },
      email_token_expiration: { type: Date, default: null },
    },
    password_rest: {
      reset_token: { type: String, default: null },
      reset_expiration: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

accountSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

accountSchema.methods.checkPassword = async function (inputPassword: string) {
  const isMatch = await bcrypt.compare(inputPassword, this.password);
  return isMatch;
};

accountSchema.methods.generateToken = async function () {
  const api_key = await crypto.randomBytes(32).toString("hex");
  this.key = api_key;
  return api_key;
};

export default mongoose.model<AccountType>("Account", accountSchema);
