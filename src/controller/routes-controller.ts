import { Request, Response } from "express";
import { JeepneyRoute } from "../models/";
import { StatusCodes } from "http-status-codes";

const createRoute = async (req: Request, res: Response) => {
  const { routeNo, routeName, routeColor } = req.body;

  const route = await JeepneyRoute.create({
    routeNo,
    routeName,
    routeColor,
  });

  res.status(StatusCodes.CREATED).json(route);
};

const getRoutes = async (req: Request, res: Response) => {
  const routes = await JeepneyRoute.find({
    $or: [{ status: "completed" }, { status: "verified" }],
  });

  res.status(StatusCodes.OK).json(routes);
};

const getRoute = async (req: Request, res: Response) => {};

const updateRoute = async (req: Request, res: Response) => {};

const deleteRoute = async (req: Request, res: Response) => {};

export { createRoute, getRoutes, getRoute, updateRoute, deleteRoute };
