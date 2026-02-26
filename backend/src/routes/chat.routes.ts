import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import {
  deleteChat,
  getChats,
  getOrCreateChat,
} from "../controllers/chat.controller";

const router = Router();
router.use(protectRoute);
router.get("/", getChats);
router.delete("/:chatId", deleteChat);
router.post("/with/:participantId", getOrCreateChat);
export default router;
