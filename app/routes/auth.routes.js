import express from "express";
const router = express.Router();
import * as authController from "../controllers/auth.controller.js";

router.post("/sign-up", authController.signup);

router.post("/sign-in", authController.signin);

router.post("/google", authController.google);

router.post("/refresh-token", authController.refreshAccessToken);

export default router;
