import express from "express";
import {
  loginAdmin,
  adminLogout,
  adminRefresh,
  loginUser,
  adminUserLogout,
} from "../controller/auth-controller";
import joiValidaiton from "../middleware/joiValidation";
const router = express.Router();
import rateLimit from "express-rate-limit";
import loginSchema from "../validation/auth-validation";

const loginRegiserLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute,
  max: 5, // 10 requests per minute
  message: "Too many request from this IP, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(loginRegiserLimiter);

router.post("/admin-login", joiValidaiton(loginSchema.loginSchema), loginAdmin);
router.delete("/admin-logout", adminLogout);
router.get("/admin-refresh", adminRefresh);

router.post("/user-login", joiValidaiton(loginSchema.loginSchema), loginUser);
router.delete("/user-logout", adminUserLogout);

export default router;
