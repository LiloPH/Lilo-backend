import express, { Express, Request, Response } from "express";
import "dotenv/config";
import "express-async-errors";
import cookieParser from "cookie-parser";
const cors = require("cors");
const morgan = require("morgan");

import notFound from "./middleware/not-found";
import errorHandler from "./middleware/errorHandler";
import {
  adminRoutes,
  authRoutes,
  userRoutes,
  jeepneyRoutes,
  tourRoutes,
} from "./routes";

export const app: Express = express();

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:2003", "https://lilo-two.vercel.app"],
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/routes", jeepneyRoutes);
app.use("/api/v1/tour", tourRoutes);

app.use(errorHandler);
app.use(notFound);
