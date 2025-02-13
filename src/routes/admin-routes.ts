import { Router } from "express";
import { analytics } from "../controller/admin-controller";
import { authToken, authPermission } from "../middleware/authMiddleware";

const router = Router();

router.use(authToken);
router.use(authPermission("admin"));

router.get("/", analytics);

export default router;
