import mongoose from "mongoose";

interface StopType {
  name: string;
  order: number;
  location: { lat: number; lng: number };
  routeNo: number;
}

interface LocationType {
  name: string;
  isOutBound: boolean;
  order: number;
  location: { lat: number; lng: number };
  routeNo: number;
  stops: StopType[];
}

interface JeepneyRouteType {
  _id: string;
  routeNo: number;
  routeName: string;
  routeColor: string;
  waypoints: LocationType[];
  status: string;
  points: {
    inBoundPoints: string;
    outBoundPoints: string;
  };
}

const stopSchema = new mongoose.Schema<StopType>(
  {
    name: { type: String, default: "" },
    order: { type: Number },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    routeNo: { type: Number },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema<LocationType>(
  {
    name: { type: String, default: "" },
    isOutBound: { type: Boolean, default: false },
    order: { type: Number },
    location: { lat: { type: Number }, lng: { type: Number } },
    routeNo: { type: Number },
    stops: { type: [stopSchema], default: [] },
  },
  { _id: false }
);

const jeepneyRouteSchema = new mongoose.Schema<JeepneyRouteType>(
  {
    routeNo: {
      type: Number,
      required: [true, "Please provide route number"],
      unique: true,
    },
    routeName: {
      type: String,
      required: [true, "Please provide route name"],
    },
    routeColor: {
      type: String,
      required: [true, "Please provide route color"],
    },
    waypoints: { type: [locationSchema] },
    status: {
      type: String,
      enum: ["verified", "empty", "completed"],
      default: "empty",
    },
    points: {
      inBoundPoints: { type: String },
      outBoundPoints: { type: String },
    },
  },
  { timestamps: true }
);

const JeepneyRoute = mongoose.model<JeepneyRouteType>(
  "JeepneyRoute",
  jeepneyRouteSchema
);
export default JeepneyRoute;
