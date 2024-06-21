import express from "express";
const router = express.Router();
import * as messageController from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.get("/:receiverId", authMiddleware, messageController.getMessages);

router.post("/send/:receiverId", authMiddleware, messageController.sendMessage);

export default router;
