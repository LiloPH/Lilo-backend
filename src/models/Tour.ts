import mongoose, { Document, Schema } from "mongoose";

interface ILocation {
  type: string;
  coordinates: [number, number];
  address: string;
  description: string;
}

export interface ITour extends Document {
  name: string;
  rating: number;
  price: number;
  summary: string;
  description: string;
  images: string[];
  imageCover: string;
  locations: ILocation[];
  createdBy: mongoose.Types.ObjectId;
}

const tourSchema = new Schema<ITour>(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    images: [String],
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Account",
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Create and export the Tour model
const Tour = mongoose.model<ITour>("Tour", tourSchema);

export default Tour;
