import { Request, Response } from "express";
import Tour from "../models/Tour";
import { StatusCodes } from "http-status-codes";
import { BadRequest, NotFoundError } from "../errors";

const getAllTour = async (req: Request, res: Response) => {
  const tours = await Tour.find({});

  res.status(StatusCodes.OK).json({ length: tours.length, tours });
};

const createTour = async (req: Request, res: Response) => {
  const { name, description, summary, price, cover_image, images } = req.body;

  const tour = await Tour.create({
    name,
    description,
    summary,
    price,
    imageCover: cover_image,
    images,
  });

  res.status(201).json({
    _id: tour._id,
    name: tour.name,
    description: tour.description,
    summary: tour.summary,
    price: tour.price,
    cover_image: tour.imageCover,
    images: tour.images,
  });
};

const getOneTour = async (req: Request, res: Response) => {
  const { id } = req.params;

  const tour = await Tour.findById(id);

  if (!tour) throw new BadRequest("Invalid Tour");

  res.status(StatusCodes.OK).json(tour);
};

const updateTourDetails = async (req: Request, res: Response) => {
  const { name, description, summary, price, cover_image, images } = req.body;
  const { id } = req.params;

  const tour = await Tour.findByIdAndUpdate(
    id,
    { name, description, summary, price, cover_image, images },
    { new: true, runValidators: true }
  );

  if (!tour) throw new BadRequest("Invalid Tour");

  res.status(StatusCodes.OK).json(tour);
};

const updateTourLocation = async (req: Request, res: Response) => {
  res.send("ENDPOINT");
};

const deleteTour = async (req: Request, res: Response) => {
  const { id } = req.params;

  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) throw new BadRequest("Invalid Tour");

  res.status(StatusCodes.OK).json({ message: "Deleted Successfully" });
};

export {
  getAllTour,
  createTour,
  getOneTour,
  updateTourDetails,
  updateTourLocation,
  deleteTour,
};
