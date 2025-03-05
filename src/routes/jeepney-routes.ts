import { Router } from "express";
import {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
} from "../controller/routes-controller";
import {
  authToken,
  authPermission,
  authKey,
} from "../middleware/authMiddleware";

const router = Router();

router
  .route("/")
  .get(authKey, authPermission("admin", "merchant", "user"), getRoutes)
  .post(authToken, authPermission("admin"), createRoute);

router.use(authKey);
router.use(authPermission("admin"));
router.route("/:id").get(getRoute).patch(updateRoute).delete(deleteRoute);

export default router;
