import express from "express";
import {
  login,
  register,
  logout,
  sendEmail,
  verifyEmailConfirmation,
} from "../controller/auth-controller";
import joiValidaiton from "../middleware/joiValidation";
import {
  loginSchema,
  newEmailSchema,
  registerSchema,
} from "../validation/auth-validation";
const router = express.Router();
import rateLimit from "express-rate-limit";

const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds,
  max: 1, // 1 request per 60 seconds
  message: "Email already sent. Please try again after 60 seconds",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginRegiserLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute,
  max: 5, // 10 requests per minute
  message: "Too many request from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginRegiserLimiter, joiValidaiton(loginSchema), login);
router.post(
  "/register",
  loginRegiserLimiter,
  joiValidaiton(registerSchema),
  register
);
router.delete("/logout", logout);
router.post(
  "/new-email-confirmation",
  emailLimiter,
  joiValidaiton(newEmailSchema),
  sendEmail
);
router.post("/verify-email-confirmation", verifyEmailConfirmation);

export default router;
