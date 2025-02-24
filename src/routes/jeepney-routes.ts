import { Router } from "express";
import {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
} from "../controller/routes-controller";
const router = Router();

router.route("/").get(getRoutes).post(createRoute);
router.route("/:id").get(getRoute).patch(updateRoute).delete(deleteRoute);

export default router;
