import express from "express";
const router = express.Router();
import * as authController from "../controllers/auth.controller.js";

router.post("/sign-up", authController.signup);

export default router;
