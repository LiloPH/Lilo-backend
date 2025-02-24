import { Router } from "express";
import {
  analytics,
  user,
  promoteUser,
  getRoutes,
} from "../controller/admin-controller";
import { authToken, authPermission } from "../middleware/authMiddleware";

const router = Router();

router.use(authToken);
router.use(authPermission("admin"));

router.get("/", analytics);
router.get("/users", user);
router.post("/promote-user", promoteUser);
router.get("/routes", getRoutes);
export default router;
