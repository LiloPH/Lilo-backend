import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  tokenType: {
    type: String,
    enum: ["access", "refresh", "key", "id_token"],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Token", TokenSchema);
