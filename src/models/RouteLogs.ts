import mongoose, { Document, Types } from "mongoose";

interface routeLogs {
  _id: string;
  route:
    | Types.ObjectId
    | { _id: Types.ObjectId; routeNo: string; routeName: string };
  message: string;
  changedBy: Types.ObjectId | { _id: Types.ObjectId; name: string };
  createdAt: Date;
  updatedAt: Date;
}

const RouteLogsSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JeepneyRoute",
      required: [true, "Please provide route"],
    },
    message: {
      type: String,
      required: [true, "Please provide message"],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<routeLogs>("RouteLogs", RouteLogsSchema);
