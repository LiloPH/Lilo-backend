import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils";
import notFound from "./middleware/not-found";
import errorHandler from "./middleware/errorHandler";
import "express-async-errors";
import { authRoutes } from "./routes";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const db_url = process.env.DB_LOCAL_URI!;

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);
app.use(notFound);

const start = async () => {
  await connectDB(db_url);
  app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}/`);
  });
};

start();
