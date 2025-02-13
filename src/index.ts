import express, { Express, Request, Response } from "express";
require("dotenv").config();
import { connectDB } from "./utils";
import notFound from "./middleware/not-found";
import errorHandler from "./middleware/errorHandler";
import "express-async-errors";
import cookieParser from "cookie-parser";
const cors = require("cors");
import { adminRoutes, authRoutes, userRoutes } from "./routes";

const app: Express = express();
const port = process.env.PORT || 3000;
const db_url = process.env.DB_LOCAL_URI!;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", userRoutes);

app.use(errorHandler);
app.use(notFound);

const start = async () => {
  await connectDB(db_url);
  app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}/`);
  });
};

start();
