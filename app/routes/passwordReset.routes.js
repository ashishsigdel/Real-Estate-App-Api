import express from "express";
const router = express.Router();
import * as passwordResetController from "../controllers/passwordReset.controller.js";

router.post("/forgot-password", passwordResetController.forgotPassword);

router.post("/verify-otp", passwordResetController.verifyOtp);

router.post("/reset-password", passwordResetController.resetPassword);

export default router;
