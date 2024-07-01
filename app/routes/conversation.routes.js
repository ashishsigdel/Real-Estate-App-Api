import express from "express";
const router = express.Router();
import * as conversationController from "../controllers/conversation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.get("/", authMiddleware, conversationController.fetchConversation);

export default router;
