import { Router } from "express";
import {
  getAllTour,
  createTour,
  getOneTour,
  updateTourDetails,
  deleteTour,
} from "../controller/tour-controller";
import joiValidaiton from "../middleware/joiValidation";
import createTourSchema from "../validation/tour-validation";

const router = Router();

router
  .route("/")
  .get(getAllTour)
  .post(joiValidaiton(createTourSchema), createTour);
router
  .route("/:id")
  .get(getOneTour)
  .patch(joiValidaiton(createTourSchema), updateTourDetails)
  .delete(deleteTour);

export default router;
