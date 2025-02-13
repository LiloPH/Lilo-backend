import express from "express";
import { getOneUser } from "../controller/user-controller";
import { authKey, authPermission } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authKey);
router.use(authPermission("user"));

router.get("/", getOneUser);

export default router;
