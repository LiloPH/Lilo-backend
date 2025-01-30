import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  tokenType: {
    type: String,
    enum: ["access", "refresh", "key"],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("Token", TokenSchema);
