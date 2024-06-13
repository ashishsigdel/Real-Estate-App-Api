import express from "express";

const router = express.Router();
import authRouter from "./auth.routes.js";
import PasswordResetRoute from "./passwordReset.routes.js";

router.use("/auth", authRouter);
router.use("/password-reset", PasswordResetRoute);

export default router;
