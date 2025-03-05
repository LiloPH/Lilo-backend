import { Request, Response } from "express";
import { JeepneyRoute, RouteLogs } from "../models/";
import { StatusCodes } from "http-status-codes";
import { BadRequest, NotFoundError } from "../errors";
import { updateVersion } from "../utils";

const createRoute = async (req: Request, res: Response) => {
  const { routeNo, routeName, routeColor } = req.body;

  const route = await JeepneyRoute.create({
    routeNo,
    routeName,
    routeColor,
  });

  res.status(StatusCodes.CREATED).json({
    _id: route._id,
    routeNo: route.routeNo,
    routeName: route.routeName,
    routeColor: route.routeColor,
    status: route.status,
  });
};

const getRoutes = async (req: Request, res: Response) => {
  const routes = await JeepneyRoute.find({
    $or: [{ status: "completed" }, { status: "verified" }],
  });

  res.status(StatusCodes.OK).json(routes);
};

const getRoute = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new BadRequest("Invalid Param");

  const route = await JeepneyRoute.findById(id);

  if (!route) throw new NotFoundError("Route not found");

  res.status(StatusCodes.OK).json(route);
};

const updateRoute = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { routeName, routeColor, status } = req.body;

  const route = await JeepneyRoute.findById(id);

  if (!route) throw new NotFoundError("Route not found");

  const upadtedRoute = await JeepneyRoute.findByIdAndUpdate(
    id,
    { routeName, routeColor, status },
    { new: true, runValidators: true }
  ).select("_id routeNo routeName routeColor status");

  await updateVersion();

  res.status(StatusCodes.OK).json(upadtedRoute);
};

const deleteRoute = async (req: Request, res: Response) => {
  const { id } = req.params;

  const route = await JeepneyRoute.findById(id);

  if (!route) throw new NotFoundError("Route not found");

  const deleteRoute = await JeepneyRoute.findByIdAndDelete(id);

  await RouteLogs.deleteMany({ route: id });

  res
    .status(StatusCodes.OK)
    .json({ message: `Route Number:${route.routeNo} successfully deleted ` });
};

export { createRoute, getRoutes, getRoute, updateRoute, deleteRoute };
