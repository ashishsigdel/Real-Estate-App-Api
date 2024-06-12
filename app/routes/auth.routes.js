import express from "express";
const router = express.Router();
import * as authController from "../controllers/auth.controller.js";

router.post("/sign-up", authController.signup);

router.post("/sign-in", authController.signin);

router.post("/google", authController.google);

router.post("/refresh-token", authController.refreshAccessToken);

router.post("/send-email-verification", authController.sendEmailVerification);

router.post("/verify-email", authController.verifyEmail);

router.post("/sign-out", authController.logout);

export default router;
