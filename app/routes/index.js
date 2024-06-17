import express from "express";

const router = express.Router();
import authRouter from "./auth.routes.js";
import PasswordResetRoute from "./passwordReset.routes.js";
import UserRoute from "./user.routes.js";
import PostCategoryRoute from "./postCategory.route.js";

router.use("/auth", authRouter);
router.use("/password-reset", PasswordResetRoute);
router.use("/users", UserRoute);
router.use("/post-category", PostCategoryRoute);

export default router;
