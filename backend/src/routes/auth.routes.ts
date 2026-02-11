import { Router } from "express";
import { authCallback, getCurrent } from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

router.get("/current", protectRoute, getCurrent);
router.post("/callback",authCallback);

export default router;