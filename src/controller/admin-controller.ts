import { Request, Response } from "express";
import { Account, JeepneyRoute, RouteLogs } from "../models";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequest } from "../errors";

const analytics = async (req: Request, res: Response) => {
  const account = await Account.find({ role: "user" });

  res.status(StatusCodes.OK).json({ users: account.length });
};

const user = async (req: Request, res: Response) => {
  const accounts = await Account.find({ role: "user" }).select(
    "_id name email picture"
  );

  res.status(StatusCodes.OK).json(accounts);
};

const promoteUser = async (req: Request, res: Response) => {
  const { id, confirmation } = req.body;

  const user = await Account.findById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (confirmation !== `${user.name}-PROMOTE`) {
    throw new BadRequest("Invalid confirmation");
  }

  user.role = "admin";
  await user.save();

  res.status(StatusCodes.OK).json({ message: "User promoted to admin" });
};

const getRoutes = async (req: Request, res: Response) => {
  const routes = await JeepneyRoute.find({});
  const routeLogs = await RouteLogs.find({ route: { $ne: null } })
    .sort({ routeNo: 1 })
    .populate("changedBy", "name")
    .populate("route", "routeNo routeName");

  const routesWithLogs = routes.map((route) => {
    const log = routeLogs.find(
      (log) =>
        log.route &&
        (typeof log.route === "object"
          ? log.route._id.toString() === route._id.toString()
          : log.route === route._id.toString())
    );

    return {
      _id: route._id,
      routeNo: route.routeNo,
      routeName: route.routeName,
      routeColor: route.routeColor,
      status: route.status,
      lastChange: log
        ? {
            changedBy:
              typeof log.changedBy === "object" && "name" in log.changedBy
                ? log.changedBy.name
                : null,
            message: log.message,
            time: log.updatedAt,
          }
        : {
            changedBy: null,
            message: null,
            time: null,
          },
    };
  });

  res.status(StatusCodes.OK).json({
    totalRoutes: routes.length,
    routes: routesWithLogs,
  });
};

export { analytics, user, promoteUser, getRoutes };
