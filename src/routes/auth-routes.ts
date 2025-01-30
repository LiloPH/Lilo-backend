import express from "express";
import { login, logout } from "../controller/auth-controller";
import joiValidaiton from "../middleware/joiValidation";
const router = express.Router();
import rateLimit from "express-rate-limit";

const loginRegiserLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute,
  max: 5, // 10 requests per minute
  message: "Too many request from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", login);

router.delete("/logout", logout);

export default router;
