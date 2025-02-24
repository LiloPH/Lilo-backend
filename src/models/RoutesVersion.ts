import mongoose, { Document } from "mongoose";

export interface RoutesVersionField extends Document {
  lastModified: Date;
  version: number;
}

const routesVersionSchema = new mongoose.Schema(
  {
    lastModified: { type: Date, default: Date.now },
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<RoutesVersionField>(
  "RoutesVersion",
  routesVersionSchema
);
