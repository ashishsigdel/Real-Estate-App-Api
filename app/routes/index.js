import express from "express";

const router = express.Router();
import authRouter from "./auth.routes.js";
import PasswordResetRoute from "./passwordReset.routes.js";
import UserRoute from "./user.routes.js";
import PostCategoryRoute from "./postCategory.routes.js";
import CountryRoute from "./country.routes.js";
import PostRoute from "./post.routes.js";
import MessageRoute from "./message.routes.js";
import ConversationRoute from "./conversation.routes.js";

router.use("/auth", authRouter);
router.use("/password-reset", PasswordResetRoute);
router.use("/users", UserRoute);
router.use("/post-category", PostCategoryRoute);
router.use("/country", CountryRoute);
router.use("/post", PostRoute);
router.use("/message", MessageRoute);
router.use("/conversations", ConversationRoute);

export default router;
